import { getUserFromId } from "@/lib/auth";
import { idHandler } from "@/lib/utils/idHandler";
import { SQSClient } from "@aws-sdk/client-sqs";
import * as Sentry from "@sentry/aws-serverless";
import type { SQSEvent, SQSRecord } from "aws-lambda";
import { eq } from "drizzle-orm";
import { config } from "~/config";
import { db } from "~/db";
import { interviews, reports } from "~/db/schema";
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
      let reportId = 0;
      try {
        const {
          data: { reportId: id, interviewId },
          userId,
        } = JSON.parse(record.body);
        reportId = id;

        const interview = await db.query.interviews.findFirst({
          where: eq(interviews.id, interviewId),
        });

        if (!interview) {
          logger.error({ reportId, interviewId }, "Interview not found");
          throw new Error("Interview not found");
        }

        const user = await getUserFromId(userId);
        logger.info({ reportId, interviewId }, "Processing interview audio save request");

        // Poll for audio reconstruction status until complete
        logger.info({ reportId, interviewId }, "Polling for audio reconstruction status");
        const reconstructionResponse = await pollAudioReconstructionStatus(interviewId);

        if (!reconstructionResponse.signed_audio_url) {
          logger.error({ reportId }, "No signed audio URL in reconstruction response");
          throw new Error("No signed audio URL in reconstruction response");
        }

        // Download the audio file
        logger.info({ reportId }, "Downloading audio file");
        const audioData = await downloadAudioFile(reconstructionResponse.signed_audio_url);

        // Upload the audio file to S3
        logger.info({ reportId, interviewId }, "Uploading audio to S3");
        const cloudFrontUrl = await uploadAudioToS3(
          audioData,
          interviewId,
          reconstructionResponse.filename
        );

        // Update the interview with the audio URL
        logger.info({ reportId, cloudFrontUrl }, "Updating interview with audio URL");

        await db
          .update(reports)
          .set({
            interviewAudioUrl: cloudFrontUrl,
            updatedAt: new Date(),
          })
          .where(eq(reports.id, reportId));

        logger.info({ reportId, cloudFrontUrl }, "Successfully saved interview audio to S3");

        // Send notification
        await sendDiscordDM({
          title: "✅ Interview Audio Saved",
          metadata: {
            "User ID": userId,
            "User Email": user?.email ?? "Unknown",
            "Report ID": reportId,
            "Report URL": `${config.baseUrl}/dashboard/jobs/${idHandler.encode(
              interview.jobId
            )}/interviews/${idHandler.encode(interviewId)}/reports/${idHandler.encode(reportId)}`,
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
            reportId,
          },
          "Error processing interview audio save request"
        );

        await handleError({
          sqsClient: sqs,
          record,
          error: error as Error,
          onFailure: async () => {
            await sendDiscordDM({
              title: "❌ Interview Audio Save Failed",
              description: "Failed to save interview audio to S3",
              metadata: {
                "Record ID": record.messageId,
                "Report ID": record.body ? JSON.parse(record.body).data?.reportId : "unknown",
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
      "Error processing interview audio save request"
    );
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
});

export default handler;
