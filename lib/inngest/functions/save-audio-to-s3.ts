import { getUserFromId } from "@/lib/auth";
import {
  downloadAudioFile,
  requestChatAudioReconstruction,
} from "@/lib/utils/hume-audio-reconstruction";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { config } from "~/config";
import { db } from "~/db";
import { interviews, reports } from "~/db/schema";
import { sendDiscordDM } from "~/lib/discord";
import { inngest } from "~/lib/inngest";
import { logger } from "~/lib/logger";
import { uploadAudioToS3 } from "~/lib/utils/s3-audio";

export const saveAudioToS3Fn = inngest.createFunction(
  {
    id: "save-audio-to-s3",
    retries: 2,
    concurrency: [{ limit: 5 }],
    onFailure: async ({ error, event }) => {
      const reportId = event.data.event.data.reportId;
      await db
        .update(reports)
        .set({ audioSaveSkippedReason: "failed-after-retries", updatedAt: new Date() })
        .where(eq(reports.id, reportId));
      await sendDiscordDM({
        title: "❌ Interview Audio Save Failed",
        description: "Failed to save interview audio to S3 after retries",
        metadata: {
          "Report ID": reportId,
          "Interview ID": event.data.event.data.interviewId,
          Error: error.message,
          Timestamp: new Date().toISOString(),
        },
      });
    },
  },
  { event: "interview/audio-save.requested" },
  async ({ event, step }) => {
    const { reportId, interviewId, userId } = event.data;

    // Step 1: Load interview data
    const interview = await step.run("load-interview", async () => {
      const interview = await db.query.interviews.findFirst({
        where: eq(interviews.id, interviewId),
      });

      if (!interview) throw new Error(`Interview not found: ${interviewId}`);
      return interview;
    });

    const chatId = interview.humeChatId;
    if (!chatId) {
      logger.warn({ interviewId }, "No humeChatId — skipping audio save");
      await step.run("mark-skipped-no-hume-chat-id", () =>
        db
          .update(reports)
          .set({ audioSaveSkippedReason: "no-hume-chat-id", updatedAt: new Date() })
          .where(eq(reports.id, reportId))
      );
      return { skipped: true, reason: "no-hume-chat-id" };
    }

    // Step 2: Poll for audio reconstruction with durable sleep
    let reconstructionResponse: any = null;

    for (let i = 0; i < 20; i++) {
      const status = await step.run(`poll-audio-${i}`, () =>
        requestChatAudioReconstruction(chatId)
      );

      if (status.status === "COMPLETE") {
        reconstructionResponse = status;
        break;
      }

      if (status.status === "ERROR" || status.status === "CANCELED") {
        const reason = `hume-status-${status.status.toLowerCase()}`;
        logger.warn(
          { interviewId, chatId, status: status.status },
          "Audio reconstruction unavailable — skipping"
        );
        await step.run("mark-skipped-hume-terminal", () =>
          db
            .update(reports)
            .set({ audioSaveSkippedReason: reason, updatedAt: new Date() })
            .where(eq(reports.id, reportId))
        );
        return { skipped: true, reason };
      }

      await step.sleep(`wait-${i}`, "10s");
    }

    if (!reconstructionResponse?.signed_audio_url) {
      logger.warn({ interviewId, chatId }, "Audio reconstruction timed out — skipping");
      await step.run("mark-skipped-timeout", () =>
        db
          .update(reports)
          .set({ audioSaveSkippedReason: "timeout", updatedAt: new Date() })
          .where(eq(reports.id, reportId))
      );
      return { skipped: true, reason: "timeout" };
    }

    // Step 3: Download and upload audio (combined to avoid Buffer serialization)
    const cloudFrontUrl = await step.run("download-and-upload", async () => {
      const audioData = await downloadAudioFile(reconstructionResponse.signed_audio_url);
      return uploadAudioToS3(audioData, chatId, reconstructionResponse.filename);
    });

    // Step 5: Update report in DB
    await step.run("update-report", async () => {
      await db
        .update(reports)
        .set({
          interviewAudioUrl: cloudFrontUrl,
          updatedAt: new Date(),
        })
        .where(eq(reports.id, reportId));
    });

    // Step 6: Send notification
    await step.run("notify", async () => {
      const user = await getUserFromId(userId);
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
    });

    return { cloudFrontUrl };
  }
);
