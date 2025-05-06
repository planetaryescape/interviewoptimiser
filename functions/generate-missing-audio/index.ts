import { requestChatAudioReconstruction } from "@/lib/utils/hume-audio-reconstruction";
import * as Sentry from "@sentry/aws-serverless";
import { eq, isNull } from "drizzle-orm";
import { db } from "~/db";
import { chatMetadata, interviews } from "~/db/schema";
import { sendDiscordDM } from "~/lib/discord";
import { logger } from "~/lib/logger";
import { initSentry } from "../lib/sentry";

initSentry();

const apiGatewayUrl = process.env.API_GATEWAY_URL ?? "";

export const handler = Sentry.wrapHandler(async () => {
  try {
    logger.info("Checking for interviews with chatMetadata but missing audio");

    // Find interviews with chatMetadata and no interviewAudioUrl
    const interviewsToProcess = await db
      .select({
        id: interviews.id,
        userId: interviews.userId,
        chatId: chatMetadata.chatId,
      })
      .from(interviews)
      .innerJoin(chatMetadata, eq(chatMetadata.interviewId, interviews.id))
      .where(isNull(interviews.interviewAudioUrl));

    logger.info(
      {
        message: "MONITORING",
        count: interviewsToProcess.length,
        unit: "Count",
        metric: "MissingAudio",
        lambda: "GenerateMissingAudio",
      },
      "Missing audio metric"
    );

    if (interviewsToProcess.length > 0) {
      await sendDiscordDM({
        title: "⚠️ Generating missing audio for interviews",
        metadata: {
          Count: interviewsToProcess.length,
          "Interview IDs": interviewsToProcess.map((i) => i.id).join(", "),
          Timestamp: new Date().toISOString(),
        },
      });
    }

    for (const interview of interviewsToProcess) {
      logger.info({ interviewId: interview.id }, "Requesting audio reconstruction");
      try {
        const reconstructionResponse = await requestChatAudioReconstruction(interview.chatId);
        logger.info(
          { interviewId: interview.id, reconstructionResponse },
          "Audio reconstruction requested"
        );
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "generateMissingAudio");
          scope.setExtra("error", error);
          scope.setExtra("message", error instanceof Error ? error.message : error);
          scope.setExtra("interviewId", interview.id);
          Sentry.captureException(error);
        });
        logger.error({ error, interviewId: interview.id }, "Error requesting audio reconstruction");
        continue;
      }

      // Queue the save-chat-audio-to-s3 Lambda (simulate POST /api/report logic)
      try {
        const queueResponse = await fetch(apiGatewayUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              interviewId: interview.id,
            },
            userId: interview.userId,
            queueType: "save-interview-audio-to-s3",
          }),
        });
        const queueData = await queueResponse.json();
        if (!queueResponse.ok) {
          logger.error(
            {
              interviewId: interview.id,
              error: queueResponse.statusText,
              status: queueResponse.status,
              queueData,
            },
            "Failed to queue save-audio-to-s3"
          );
        }
        logger.info({ interviewId: interview.id }, "Queued save-audio-to-s3");
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "generateMissingAudio");
          scope.setExtra("error", error);
          scope.setExtra("message", error instanceof Error ? error.message : error);
          scope.setExtra("interviewId", interview.id);
          Sentry.captureException(error);
        });
        logger.error({ error, interviewId: interview.id }, "Error queueing save-audio-to-s3");
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Processed ${interviewsToProcess.length} interviews with missing audio`,
      }),
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "generateMissingAudio");
      scope.setExtra("error", error);
      scope.setExtra("message", error instanceof Error ? error.message : error);
      Sentry.captureException(error);
    });
    logger.error({ error }, "Error generating missing audio");
    throw error;
  }
});

export default handler;
