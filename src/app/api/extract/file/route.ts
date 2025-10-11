import { withAuth } from "@/lib/auth-middleware";
import { validateFileSize } from "@/lib/utils/fileValidation";
import { formatEntity, formatErrorEntity } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/nextjs";
import mammoth from "mammoth";
import { type NextRequest, NextResponse } from "next/server";
import { extractFromDocument } from "~/lib/ai/extract-from-document";
import {
  getCachedFileExtraction,
  hashFileContent,
  setCachedFileExtraction,
} from "~/lib/file-extraction-cache";
import { logger } from "~/lib/logger";
import { getOpenAiClient } from "~/lib/openai";

export const maxDuration = 60; // 60 seconds timeout for file processing

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
        logger.warn({ userId: user.id }, "User not found in database");
        return NextResponse.json(formatErrorEntity("User not found"), {
          status: 404,
        });
      }

      // Parse form data
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        logger.warn({ userId: user.id }, "No file provided");
        return NextResponse.json(formatErrorEntity("No file provided"), {
          status: 400,
        });
      }

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        logger.warn({ userId: user.id, fileType: file.type }, "Unsupported file type");
        return NextResponse.json(
          formatErrorEntity({
            error: "Unsupported file type",
            supportedTypes: ALLOWED_FILE_TYPES,
          }),
          { status: 400 }
        );
      }

      // Validate file size
      const validation = validateFileSize(file);
      if (!validation.isValid) {
        logger.warn({ userId: user.id, fileSize: file.size }, "File validation failed");
        return NextResponse.json(formatErrorEntity(validation.error || "File validation failed"), {
          status: 400,
        });
      }

      logger.info(
        {
          userId: user.id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        },
        "Starting file extraction"
      );

      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      const fileBuffer = Buffer.from(uint8Array);

      // Hash the file content for caching
      const fileHash = hashFileContent(fileBuffer);
      logger.info({ userId: user.id, fileHash, fileName: file.name }, "File hash generated");

      // Check if extraction is already cached
      const cachedExtraction = await getCachedFileExtraction(fileHash);
      if (cachedExtraction) {
        logger.info(
          {
            userId: user.id,
            fileHash,
            hitCount: cachedExtraction.hitCount,
            textLength: cachedExtraction.extractedText.length,
          },
          "Returning cached file extraction"
        );

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

      // Determine extraction type based on file name
      const fileName = file.name.toLowerCase();
      const extractionType =
        fileName.includes("cv") || fileName.includes("resume")
          ? "cv"
          : fileName.includes("job") || fileName.includes("jd")
            ? "job_description"
            : "general";

      let extractedText: string;

      // Check if it's a PDF or image that can be processed by Vision API
      if (
        file.type === "application/pdf" ||
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/webp" ||
        file.type === "image/gif"
      ) {
        logger.info(`Starting to extract text from ${file.type} using Vision AI`);

        // Use vision model (gpt-5-mini) for document extraction
        const model = getOpenAiClient(user.email)("gpt-5-mini");
        const result = await extractFromDocument({
          model: model as any,
          fileBuffer,
          fileType: file.type,
          userEmail: user.email,
          extractionType,
        });

        logger.info(
          {
            userId: user.id,
            textLength: result.data?.length,
            method: "vision",
            model: "gpt-5-mini",
            fileType: file.type,
          },
          `Extracted text from ${file.type} using vision model`
        );

        extractedText = result.data;
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      ) {
        logger.info("starting to extract text from word file");
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        logger.info(
          { userId: user.id, textLength: result.value?.trim().length },
          "Extracted text from word file"
        );
        extractedText = result.value?.trim() || "";
      } else {
        throw new Error("Unsupported file type");
      }

      logger.info(
        {
          userId: user.id,
          fileName: file.name,
          extractedLength: extractedText.length,
        },
        "File extraction completed successfully"
      );

      // Cache the extraction for future use (async, don't wait)
      setCachedFileExtraction({
        fileHash,
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size,
        extractedText,
        extractionType,
      }).catch((error) => {
        logger.error({ error, fileHash }, "Failed to cache file extraction");
      });

      return NextResponse.json(
        formatEntity(
          {
            extractedText,
            fileName: file.name,
            fileType: file.type,
            characterCount: extractedText.length,
            cached: false,
          },
          "generic"
        )
      );
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "POST /api/extract/file");
        scope.setExtra("error", error);
        scope.setExtra("message", error instanceof Error ? error.message : error);
        Sentry.captureException(error);
      });

      logger.error(
        {
          message: error instanceof Error ? error.message : "Unknown error",
          error,
        },
        "Error in POST /api/extract/file"
      );

      // Don't expose internal error details to client
      const message =
        error instanceof Error && error.message.includes("extract")
          ? error.message
          : "Failed to extract content from file";

      return NextResponse.json(formatErrorEntity(message), { status: 500 });
    }
  },
  { routeName: "POST /api/extract/file" }
);
