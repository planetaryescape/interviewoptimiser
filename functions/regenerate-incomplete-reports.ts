import { db } from "@/db";
import { interviews, reports } from "@/db/schema";
import { sendDiscordDM } from "@/lib/discord";
import { logger } from "@/lib/logger";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import * as Sentry from "@sentry/aws-serverless";
import { and, eq, lt } from "drizzle-orm";

Sentry.init({
  dsn: "https://abf04e7d8150b91d6693971ce1495588@o4508119114514432.ingest.de.sentry.io/4508324268605520",
  // integrations: [nodeProfilingIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

const sqs = new SQSClient({ region: process.env.LAMBDA_AWS_REGION });

export const handler = Sentry.wrapHandler(async () => {
  try {
    logger.info("Checking for incomplete reports");

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const incompleteReports = await db
      .select({ id: reports.id, interviewId: reports.interviewId })
      .from(reports)
      .where(
        and(
          eq(reports.isCompleted, false),
          lt(reports.createdAt, tenMinutesAgo)
        )
      );

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
          scope.setExtra(
            "message",
            error instanceof Error ? error.message : error
          );
          scope.setExtra("reportId", report.id);
          Sentry.captureException(error);
        });
        logger.error(
          { error, reportId: report.id },
          "Error sending message to SQS queue"
        );

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
