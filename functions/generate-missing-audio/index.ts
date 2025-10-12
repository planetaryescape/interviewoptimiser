import { requestChatAudioReconstruction } from "@/lib/utils/hume-audio-reconstruction";
import * as Sentry from "@sentry/aws-serverless";
import { and, isNull } from "drizzle-orm";
import { db } from "~/db";
import { reports } from "~/db/schema";
import { sendDiscordDM } from "~/lib/discord";
import { logger } from "~/lib/logger";
import { initSentry } from "../lib/sentry";

initSentry();

const apiGatewayUrl = process.env.API_GATEWAY_URL ?? "";

export const handler = Sentry.wrapHandler(async () => {
  try {
    logger.info("Checking for reports without audio");

    const reportsToProcess = await db.query.reports.findMany({
      where: and(isNull(reports.interviewAudioUrl)),
      with: {
        interview: {
          with: {
            job: true,
          },
        },
      },
    });

    logger.info(
      {
        message: "MONITORING",
        count: reportsToProcess.length,
        unit: "Count",
        metric: "MissingAudio",
        lambda: "GenerateMissingAudio",
      },
      "Missing audio metric"
    );

    if (reportsToProcess.length > 0) {
      await sendDiscordDM({
        title: "⚠️ Generating missing audio for reports",
        metadata: {
          Count: reportsToProcess.length,
          "Report IDs": reportsToProcess.map((r) => r.id).join(", "),
          Timestamp: new Date().toISOString(),
        },
      });
    }

    for (const report of reportsToProcess) {
      // Skip if interview doesn't have Hume chat ID (shouldn't happen for completed interviews)
      if (!report.interview.humeChatId) {
        logger.warn(
          { reportId: report.id },
          "Skipping audio reconstruction - missing humeChatId"
        );
        continue;
      }

      logger.info({ reportId: report.id }, "Requesting audio reconstruction");
      try {
        const reconstructionResponse = await requestChatAudioReconstruction(
          report.interview.humeChatId
        );
        logger.info(
          { reportId: report.id, reconstructionResponse },
          "Audio reconstruction requested"
        );
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "generateMissingAudio");
          scope.setExtra("error", error);
          scope.setExtra("message", error instanceof Error ? error.message : error);
          scope.setExtra("reportId", report.id);
          Sentry.captureException(error);
        });
        logger.error({ error, reportId: report.id }, "Error requesting audio reconstruction");
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
              reportId: report.id,
              interviewId: report.interview.humeChatId,
            },
            userId: report.interview.job.userId,
            queueType: "save-interview-audio-to-s3",
          }),
        });
        const queueData = await queueResponse.json();
        if (!queueResponse.ok) {
          logger.error(
            {
              reportId: report.id,
              error: queueResponse.statusText,
              status: queueResponse.status,
              queueData,
            },
            "Failed to queue save-audio-to-s3"
          );
        }
        logger.info({ reportId: report.id }, "Queued save-audio-to-s3");
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "generateMissingAudio");
          scope.setExtra("error", error);
          scope.setExtra("message", error instanceof Error ? error.message : error);
          scope.setExtra("reportId", report.id);
          Sentry.captureException(error);
        });
        logger.error({ error, reportId: report.id }, "Error queueing save-audio-to-s3");
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Processed ${reportsToProcess.length} reports with missing audio`,
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
