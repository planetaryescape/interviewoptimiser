import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import * as Sentry from "@sentry/aws-serverless";
import { and, eq, lt } from "drizzle-orm";
import { db } from "~/db";
import { interviews, reports } from "~/db/schema";
import { sendDiscordDM } from "~/lib/discord";
import { logger } from "~/lib/logger";
import { initSentry } from "../lib/sentry";

initSentry();

const sqs = new SQSClient({ region: process.env.LAMBDA_AWS_REGION });

export const handler = Sentry.wrapHandler(async () => {
  try {
    logger.info("Checking for incomplete reports");

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const incompleteReports = await db
      .select({ id: reports.id, interviewId: reports.interviewId })
      .from(reports)
      .where(and(eq(reports.isCompleted, false), lt(reports.createdAt, tenMinutesAgo)));

    logger.info(
      {
        message: "MONITORING",
        count: incompleteReports.length,
        unit: "Count",
        metric: "MissedReports",
        lambda: "RegenerateIncompleteReports",
      },
      "Missed optimizations metric"
    );

    if (incompleteReports.length > 0) {
      await sendDiscordDM({
        title: "⚠️ Regenerating incomplete reports",
        metadata: {
          Count: incompleteReports.length,
          "Report IDs": incompleteReports.map((report) => report.id).join(", "),
          Timestamp: new Date().toISOString(),
        },
      });
    }

    for (const report of incompleteReports) {
      logger.info(
        {
          reportId: report.id,
        },
        "Regenerating report"
      );

      const interview = await db
        .select()
        .from(interviews)
        .where(eq(interviews.id, report.interviewId))
        .then(([interview]) => interview);

      const message = {
        data: {
          reportId: report.id,
          interviewId: report.interviewId,
        },
        userId: interview?.userId,
      };

      const sendMessageCommand = new SendMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MessageBody: JSON.stringify(message),
      });

      try {
        await sqs.send(sendMessageCommand);
        logger.info({ reportId: report.id }, "Sent report to SQS queue");
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "regenerateIncompleteReports");
          scope.setExtra("error", error);
          scope.setExtra("message", error instanceof Error ? error.message : error);
          scope.setExtra("reportId", report.id);
          Sentry.captureException(error);
        });
        logger.error({ error, reportId: report.id }, "Error sending message to SQS queue");

        await sendDiscordDM({
          title: "❌ Failed to regenerate report",
          metadata: {
            "Report ID": report.id,
            Error: error instanceof Error ? error.message : String(error),
            Timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Regenerated ${incompleteReports.length} reports`,
      }),
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "regenerateIncompleteReports");
      scope.setExtra("error", error);
      scope.setExtra("message", error instanceof Error ? error.message : error);
      Sentry.captureException(error);
    });
    logger.error({ error }, "Error regenerating incomplete reports");
    throw error;
  }
});

export default handler;
