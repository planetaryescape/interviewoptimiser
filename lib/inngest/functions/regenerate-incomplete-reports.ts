import * as Sentry from "@sentry/nextjs";
import { db } from "~/db";
import { sendDiscordDM } from "~/lib/discord";
import { inngest } from "~/lib/inngest";
import { logger } from "~/lib/logger";

export const regenerateIncompleteReportsFn = inngest.createFunction(
  {
    id: "regenerate-incomplete-reports",
    retries: 1,
  },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const incompleteReports = await step.run("find-incomplete", async () => {
      const results = await db.query.reports.findMany({
        columns: {
          id: true,
          interviewId: true,
        },
        where: (reports, { eq }) => eq(reports.isCompleted, false),
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
          count: results.length,
          unit: "Count",
          metric: "MissedReports",
        },
        "Missed reports metric"
      );

      return results;
    });

    if (incompleteReports.length === 0) return { regenerated: 0 };

    await step.run("notify-start", () =>
      sendDiscordDM({
        title: "⚠️ Regenerating incomplete reports",
        metadata: {
          Count: incompleteReports.length,
          "Report IDs": incompleteReports.map((r) => r.id).join(", "),
          Timestamp: new Date().toISOString(),
        },
      })
    );

    for (const report of incompleteReports) {
      await step.run(`queue-regenerate-${report.id}`, async () => {
        try {
          if (!report.interview.job.userId) {
            logger.warn({ reportId: report.id }, "Skipping - no userId");
            return;
          }
          await inngest.send({
            name: "interview/report.requested",
            data: {
              jobId: report.interview.jobId,
              reportId: report.id,
              interviewId: report.interviewId!,
              userId: report.interview.job.userId,
              restart: true,
            },
          });
          logger.info({ reportId: report.id }, "Queued report regeneration");
        } catch (error) {
          Sentry.captureException(error);
          logger.error({ error, reportId: report.id }, "Error queuing report regeneration");
          await sendDiscordDM({
            title: "❌ Failed to regenerate report",
            metadata: {
              "Report ID": report.id,
              Error: error instanceof Error ? error.message : String(error),
              Timestamp: new Date().toISOString(),
            },
          });
        }
      });
    }

    return { regenerated: incompleteReports.length };
  }
);
