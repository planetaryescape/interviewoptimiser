import { withAuth } from "@/lib/auth-middleware";
import { validateFileSize } from "@/lib/utils/fileValidation";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { setExtractionResult } from "~/lib/extraction-store";
import { getCachedFileExtraction, hashFileContent } from "~/lib/file-extraction-cache";
import { inngest } from "~/lib/inngest";
import { logger } from "~/lib/logger";

export const maxDuration = 60;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];

export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    logger.info("POST request received at /api/extract/file");

    try {
      if (!user.id) {
        return NextResponse.json(formatErrorEntity("User not found"), { status: 404 });
      }

      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(formatErrorEntity("No file provided"), { status: 400 });
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json(
          formatErrorEntity({
            error: "Unsupported file type",
            supportedTypes: ALLOWED_FILE_TYPES,
          }),
          { status: 400 }
        );
      }

      const validation = validateFileSize(file);
      if (!validation.isValid) {
        return NextResponse.json(formatErrorEntity(validation.error || "File validation failed"), {
          status: 400,
        });
      }

      const buffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(new Uint8Array(buffer));
      const fileHash = hashFileContent(fileBuffer);

      // Return immediately if cached
      const cachedExtraction = await getCachedFileExtraction(fileHash);
      if (cachedExtraction) {
        logger.info({ userId: user.id, fileHash }, "Returning cached file extraction");
        return NextResponse.json(
          formatEntity(
            {
              extractedText: cachedExtraction.extractedText,
              fileName: file.name,
              fileType: file.type,
              characterCount: cachedExtraction.extractedText.length,
              cached: true,
              hitCount: cachedExtraction.hitCount,
            },
            "generic"
          )
        );
      }

      // Dispatch to Inngest for async processing
      const extractionId = crypto.randomUUID();
      const fileBase64 = fileBuffer.toString("base64");

      await setExtractionResult(extractionId, { status: "pending" });

      await inngest.send({
        name: "interview/extract-file.requested",
        data: {
          extractionId,
          fileBase64,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileHash,
          userId: user.id,
          userEmail: user.email ?? "",
        },
      });

      logger.info(
        { userId: user.id, extractionId, fileName: file.name },
        "File extraction dispatched to Inngest"
      );

      return NextResponse.json(formatEntity({ extractionId }, "generic"), { status: 202 });
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/extract/file");
        scope.setExtra("error", error);
        Sentry.captureException(error);
      });

      logger.error(
        { message: error instanceof Error ? error.message : "Unknown error", error },
        "Error in POST /api/extract/file"
      );

      const message =
        error instanceof Error && error.message.includes("extract")
          ? error.message
          : "Failed to extract content from file";

      return NextResponse.json(formatErrorEntity(message), { status: 500 });
    }
  },
  { routeName: "POST /api/extract/file" }
);
