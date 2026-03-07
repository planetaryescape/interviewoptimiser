import { serve } from "inngest/next";
import { inngest } from "~/lib/inngest";
import { extractFileFn } from "~/lib/inngest/functions/extract-file";
import { extractUrlFn } from "~/lib/inngest/functions/extract-url";
import { generateMissingAudioFn } from "~/lib/inngest/functions/generate-missing-audio";
import { generateReportFn } from "~/lib/inngest/functions/generate-report";
import { regenerateIncompleteReportsFn } from "~/lib/inngest/functions/regenerate-incomplete-reports";
import { saveAudioToS3Fn } from "~/lib/inngest/functions/save-audio-to-s3";
import { vetReviewFn } from "~/lib/inngest/functions/vet-review";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateReportFn,
    saveAudioToS3Fn,
    generateMissingAudioFn,
    regenerateIncompleteReportsFn,
    vetReviewFn,
    extractFileFn,
    extractUrlFn,
  ],
});
