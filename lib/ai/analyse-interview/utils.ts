import * as R from "remeda";
import type { z } from "zod";
import type { Interview } from "~/db/schema";
import type { CandidateDetails } from "~/lib/ai/extract-candidate-details";
import type { StructuredJobDescriptionSchema } from "~/lib/ai/extract-job-description";
import type { StructuredOriginalCVSchema } from "~/lib/ai/extract-original-cv";
import type { TranscriptEntry } from "./types";

/**
 * Formats structured data for prompt inclusion
 * @param structuredCV - CV data if available
 * @param structuredJobDescription - Job description data if available
 * @param structuredCandidateDetails - Candidate details if available
 * @returns Formatted structured data text
 */
export function formatStructuredData(
  structuredCV?: z.infer<typeof StructuredOriginalCVSchema>,
  structuredJobDescription?: z.infer<typeof StructuredJobDescriptionSchema>,
  structuredCandidateDetails?: CandidateDetails
): string {
  let structuredDataText = "No structured data available for this analysis.";

  // If we have any structured data, format it properly
  if (structuredCV || structuredJobDescription || structuredCandidateDetails) {
    structuredDataText =
      "The following structured data has been extracted and should be used to inform your analysis:";

    if (structuredCandidateDetails) {
      structuredDataText += `\n\n### CANDIDATE DETAILS\n${JSON.stringify(
        structuredCandidateDetails,
        null,
        2
      )}`;
    }

    if (structuredJobDescription) {
      structuredDataText += `\n\n### JOB DESCRIPTION\n${JSON.stringify(
        structuredJobDescription,
        null,
        2
      )}`;
    }

    if (structuredCV) {
      structuredDataText += `\n\n### CV DATA\n${JSON.stringify(structuredCV, null, 2)}`;
    }

    structuredDataText +=
      "\n\nUse this structured data as the primary source for candidate name, company name, role details, and other factual information. This data is more reliable than information you might extract from the raw transcript.";
  }

  return structuredDataText;
}

/**
 * Processes transcript data to include relevant prosody information
 * @param transcriptString - Raw transcript string
 * @returns Processed transcript array
 */
export function processTranscript(transcriptString: string): TranscriptEntry[] {
  if (!transcriptString) {
    throw new Error("No transcript found");
  }

  return JSON.parse(transcriptString).map(
    (message: {
      role: "user" | "assistant";
      content: string;
      prosody: Record<string, number>;
    }) => ({
      ...message,
      prosody: message.prosody
        ? R.pipe(message.prosody, R.entries(), R.sortBy(R.pathOr([1], 0)), R.reverse(), R.take(5))
        : undefined,
    })
  );
}

/**
 * Extracts key questions from job description
 * @param interview - The job description data
 * @returns Array of key questions or undefined if none available
 */
export function extractKeyQuestions(interview?: Interview): string[] | undefined {
  if (interview?.keyQuestions?.length) {
    return interview.keyQuestions;
  }
  return undefined;
}

/**
 * Creates a header object for API requests
 * @param userEmail - User email for tracking
 * @returns Headers object for API request
 */
export function createRequestHeaders(userEmail?: string): Record<string, string> {
  return {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
    ...(userEmail && { "Helicone-User-Id": userEmail }),
  };
}
