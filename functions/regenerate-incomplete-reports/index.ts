import * as Sentry from "@sentry/aws-serverless";
import { db } from "~/db";
import { sendDiscordDM } from "~/lib/discord";
import { logger } from "~/lib/logger";
import { initSentry } from "../lib/sentry";

initSentry();

const apiGatewayUrl = process.env.API_GATEWAY_URL ?? "";

export const handler = Sentry.wrapHandler(async () => {
  try {
    logger.info("Checking for incomplete reports");

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const incompleteReports = await db.query.reports.findMany({
      columns: {
        id: true,
        interviewId: true,
      },
      where: (reports, { and, eq, lt }) =>
        and(
          eq(reports.isCompleted, false)
          // lt(reports.createdAt, tenMinutesAgo)
        ),
      with: {
        interview: {
          columns: {
            jobId: true,
            id: true,
          },
          with: {
            job: {
              columns: {
                userId: true,
              },
            },
          },
        },
      },
    });

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

      const message = {
        data: {
          reportId: report.id,
          jobId: report.interview.jobId,
          interviewId: report.interviewId,
        },
        userId: report.interview.job.userId,
        restart: true,
      };

      try {
        const response = await fetch(apiGatewayUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...message,
            queueType: "generate-report",
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          logger.error(
            {
              reportId: report.id,
              error: response.statusText,
              status: response.status,
              responseData,
              apiGatewayUrl,
            },
            "Failed to queue report regeneration"
          );

          await sendDiscordDM({
            title: "⚠️ Regenerate Report Queue Error",
            description: "Failed to queue report regeneration",
            metadata: {
              "Report ID": report.id,
              Status: response.status,
              Error: response.statusText,
              Timestamp: new Date().toISOString(),
            },
          });

          throw new Error(response.statusText);
        }

        logger.info({ reportId: report.id }, "Sent report to API Gateway");
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "regenerateIncompleteReports");
          scope.setExtra("error", error);
          scope.setExtra("message", error instanceof Error ? error.message : error);
          scope.setExtra("reportId", report.id);
          Sentry.captureException(error);
        });
        logger.error({ error, reportId: report.id }, "Error sending message to API Gateway");

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
