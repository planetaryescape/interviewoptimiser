import { getUserFromId } from "@/lib/auth";
import { idHandler } from "@/lib/utils/idHandler";
import { SQSClient } from "@aws-sdk/client-sqs";
import * as Sentry from "@sentry/aws-serverless";
import type { SQSEvent, SQSRecord } from "aws-lambda";
import { eq } from "drizzle-orm";
import { config } from "~/config";
import { db } from "~/db";
import { chatMetadata, interviews } from "~/db/schema";
import { sendDiscordDM } from "~/lib/discord";
import { logger } from "~/lib/logger";
import { initSentry } from "../lib/sentry";
import { deleteMessage } from "../utils/deleteMessage";
import { handleError } from "../utils/handleError";
import { downloadAudioFile, pollAudioReconstructionStatus, uploadAudioToS3 } from "./utils";

initSentry();

// Initialize SQS client
const sqs = new SQSClient({ region: process.env.AWS_REGION });

export const handler = Sentry.wrapHandler(async (event: SQSEvent) => {
  try {
    logger.info({ event }, "Received event");

    if (!event.Records?.length) {
      logger.error({ event }, "Invalid event structure: Records is not an array");
      throw new Error("Invalid event structure");
    }

    const successfulRecords: SQSRecord[] = [];
    const failedRecords: SQSRecord[] = [];

    for (const record of event.Records) {
      let interviewId = 0;
      try {
        const {
          data: { interviewId: id },
          userId,
        } = JSON.parse(record.body);
        interviewId = id;

        const user = await getUserFromId(userId);
        logger.info({ interviewId }, "Processing chat audio save request");

        // Get chat metadata for the interview
        const metadata = await db.query.chatMetadata.findFirst({
          where: eq(chatMetadata.interviewId, interviewId),
        });

        if (!metadata || !metadata.chatId) {
          logger.error({ interviewId }, "No chat metadata found for this interview");
          throw new Error("No chat metadata found for this interview");
        }

        // Poll for audio reconstruction status until complete
        logger.info(
          { interviewId, chatId: metadata.chatId },
          "Polling for audio reconstruction status"
        );
        const reconstructionResponse = await pollAudioReconstructionStatus(metadata.chatId);

        if (!reconstructionResponse.signed_audio_url) {
          logger.error({ interviewId }, "No signed audio URL in reconstruction response");
          throw new Error("No signed audio URL in reconstruction response");
        }

        // Download the audio file
        logger.info({ interviewId }, "Downloading audio file");
        const audioData = await downloadAudioFile(reconstructionResponse.signed_audio_url);

        // Upload the audio file to S3
        logger.info({ interviewId, chatId: metadata.chatId }, "Uploading audio to S3");
        const cloudFrontUrl = await uploadAudioToS3(
          audioData,
          interviewId,
          metadata.chatId,
          reconstructionResponse.filename
        );

        // Update the interview with the audio URL
        logger.info({ interviewId, cloudFrontUrl }, "Updating interview with audio URL");
        await db
          .update(interviews)
          .set({
            interviewAudioUrl: cloudFrontUrl,
            updatedAt: new Date(),
          })
          .where(eq(interviews.id, interviewId));

        logger.info({ interviewId, cloudFrontUrl }, "Successfully saved chat audio to S3");

        // Send notification
        await sendDiscordDM({
          title: "✅ Interview Audio Saved",
          metadata: {
            "User ID": userId,
            "User Email": user?.email ?? "Unknown",
            "Interview ID": interviewId,
            "Interview URL": `${
              config.baseUrl
            }/dashboard/interviews/${idHandler.encode(interviewId)}`,
            "Audio URL": cloudFrontUrl,
          },
        });

        await deleteMessage(sqs, record);
        successfulRecords.push(record);
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "handler");
          scope.setExtra("error", error);
          scope.setExtra("event", event);
          scope.setExtra("message", error instanceof Error ? error.message : error);
          Sentry.captureException(error);
        });

        logger.error(
          {
            error: error instanceof Error ? error.message : error,
            interviewId,
          },
          "Error processing chat audio save request"
        );

        await handleError({
          sqsClient: sqs,
          record,
          error: error as Error,
          onFailure: async () => {
            await sendDiscordDM({
              title: "❌ Chat Audio Save Failed",
              description: "Failed to save chat audio to S3",
              metadata: {
                "Record ID": record.messageId,
                "Interview ID": record.body ? JSON.parse(record.body).data?.interviewId : "unknown",
                Error: error instanceof Error ? error.message : JSON.stringify(error),
                "Stack Trace": error instanceof Error ? error.stack : "N/A",
                Timestamp: new Date().toISOString(),
              },
            });
            failedRecords.push(record);
          },
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "All records processed",
        successCount: successfulRecords.length,
        failureCount: failedRecords.length,
      }),
    };
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : error },
      "Error processing chat audio save request"
    );
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
});

export default handler;
