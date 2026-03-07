import { requestChatAudioReconstruction } from "@/lib/utils/hume-audio-reconstruction";
import * as Sentry from "@sentry/nextjs";
import { and, isNull } from "drizzle-orm";
import { db } from "~/db";
import { reports } from "~/db/schema";
import { sendDiscordDM } from "~/lib/discord";
import { inngest } from "~/lib/inngest";
import { logger } from "~/lib/logger";

export const generateMissingAudioFn = inngest.createFunction(
  {
    id: "generate-missing-audio",
    retries: 1,
  },
  { cron: "*/10 * * * *" },
  async ({ step }) => {
    const reportsToProcess = await step.run("find-missing-audio", async () => {
      const results = await db.query.reports.findMany({
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
          count: results.length,
          unit: "Count",
          metric: "MissingAudio",
        },
        "Missing audio metric"
      );

      return results;
    });

    if (reportsToProcess.length === 0) return { processed: 0 };

    await step.run("notify-start", () =>
      sendDiscordDM({
        title: "⚠️ Generating missing audio for reports",
        metadata: {
          Count: reportsToProcess.length,
          "Report IDs": reportsToProcess.map((r) => r.id).join(", "),
          Timestamp: new Date().toISOString(),
        },
      })
    );

    for (const report of reportsToProcess) {
      if (!report.interview.humeChatId) {
        logger.warn({ reportId: report.id }, "Skipping audio reconstruction - missing humeChatId");
        continue;
      }

      // Request audio reconstruction
      await step.run(`request-reconstruction-${report.id}`, async () => {
        try {
          await requestChatAudioReconstruction(report.interview.humeChatId!);
          logger.info({ reportId: report.id }, "Audio reconstruction requested");
        } catch (error) {
          Sentry.captureException(error);
          logger.error({ error, reportId: report.id }, "Error requesting audio reconstruction");
        }
      });

      // Queue audio save via Inngest event
      if (report.interview.job.userId) {
        await step.run(`queue-audio-save-${report.id}`, () =>
          inngest.send({
            name: "interview/audio-save.requested",
            data: {
              reportId: report.id,
              interviewId: report.interview.id,
              userId: report.interview.job.userId!,
            },
          })
        );
      }
    }

    return { processed: reportsToProcess.length };
  }
);
