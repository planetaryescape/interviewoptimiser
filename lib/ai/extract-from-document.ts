import type { LanguageModelV1 } from "@ai-sdk/provider";
import * as Sentry from "@sentry/nextjs";
import { type LanguageModelUsage, generateText } from "ai";
import { logger } from "~/lib/logger";

export interface ExtractFromDocumentParams {
  model: LanguageModelV1;
  fileBuffer: Buffer;
  fileType: string;
  userEmail?: string;
  extractionType?: "cv" | "job_description" | "general";
}

export interface ExtractFromDocumentResult {
  data: string;
  usage?: LanguageModelUsage;
}

const getExtractionPrompt = (type: ExtractFromDocumentParams["extractionType"]) => {
  switch (type) {
    case "cv":
      return `Extract ALL text content from this CV/resume document.
      Include:
      - Personal information (name, email, phone, location)
      - Professional summary/objective
      - Work experience (job titles, companies, dates, descriptions)
      - Education (degrees, institutions, dates)
      - Skills (technical, soft skills, languages)
      - Certifications and awards
      - Projects and achievements
      - Links and references
      - Any custom sections

      Preserve the original formatting and structure as much as possible.
      Return the complete extracted text maintaining the document's organization.`;

    case "job_description":
      return `Extract ALL text content from this job description document.
      Include:
      - Job title and company name
      - Location and work arrangement (remote/hybrid/onsite)
      - Job summary and overview
      - Required qualifications and experience
      - Preferred qualifications
      - Responsibilities and duties
      - Required skills (technical and soft)
      - Benefits and compensation info
      - Application instructions
      - Company culture and values
      - Any other relevant sections

      Preserve the original formatting and structure.
      Return the complete extracted text maintaining the document's organization.`;

    default:
      return `Extract ALL text content from this document.
      Preserve the original formatting, structure, and organization.
      Include all sections, headers, bullet points, and details.
      Return the complete extracted text.`;
  }
};

// Main function that handles all document types (PDFs, images, etc.)
export async function extractFromDocument({
  model,
  fileBuffer,
  fileType,
  userEmail,
  extractionType = "general",
}: ExtractFromDocumentParams): Promise<ExtractFromDocumentResult> {
  const startTime = Date.now();

  try {
    logger.info(
      {
        userEmail,
        extractionType,
        fileType,
        bufferSize: fileBuffer.length,
      },
      "Starting document extraction with vision model"
    );

    // Convert buffer to base64
    const base64Data = fileBuffer.toString("base64");

    // Determine MIME type
    let mimeType: string;
    if (fileType === "application/pdf") {
      mimeType = "application/pdf";
    } else if (fileType.startsWith("image/")) {
      mimeType = fileType;
    } else {
      // Default to image/jpeg for unknown types
      mimeType = "image/jpeg";
    }

    // Create the data URL
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // Use generateText for text extraction with vision model
    // For images, use the "image" type, for PDFs use "file" type
    const contentPart = mimeType.startsWith("image/")
      ? {
          type: "image" as const,
          image: dataUrl,
        }
      : {
          type: "file" as const,
          data: dataUrl,
          mimeType: mimeType,
        };

    const result = await generateText({
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: getExtractionPrompt(extractionType),
            },
            contentPart,
          ],
        },
      ],
      maxTokens: 8000,
      temperature: 0.1, // Low temperature for accurate extraction
    });

    const duration = Date.now() - startTime;

    logger.info(
      {
        userEmail,
        extractionType,
        fileType,
        duration,
        textLength: result.text?.length,
        usage: result.usage,
      },
      "Successfully extracted text from document using vision model"
    );

    return {
      data: result.text,
      usage: result.usage,
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error(
      {
        userEmail,
        extractionType,
        fileType,
        duration,
        error: error instanceof Error ? error.message : error,
      },
      "Failed to extract text from document using vision model"
    );

    Sentry.withScope((scope) => {
      scope.setExtra("context", "extractFromDocument");
      scope.setExtra("userEmail", userEmail);
      scope.setExtra("extractionType", extractionType);
      scope.setExtra("fileType", fileType);
      scope.setExtra("error", error);
      Sentry.captureException(error);
    });

    throw new Error(
      `Failed to extract document content: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
