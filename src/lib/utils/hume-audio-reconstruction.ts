import * as Sentry from "@sentry/nextjs";
import type { InferResultType } from "~/db/helpers";
import { logger } from "~/lib/logger";

export type InterviewWithJob = InferResultType<"interviews", { job: true }>;

export interface AudioReconstructionResponse {
  id: string;
  user_id: string;
  status: "QUEUED" | "IN_PROGRESS" | "COMPLETE" | "ERROR" | "CANCELED";
  filename: string | null;
  modified_at: number;
  signed_audio_url: string | null;
  signed_url_expiration_timestamp_millis: number | null;
}

export interface ChatGroupAudioReconstructionResponse {
  id: string;
  user_id: string;
  num_chats: number;
  page_number: number;
  page_size: number;
  total_pages: number;
  pagination_direction: "ASC" | "DESC";
  audio_reconstructions_page: AudioReconstructionResponse[];
}

/**
 * Request audio reconstruction for a specific chat
 * @param chatId The Hume chat ID to reconstruct
 * @returns Promise with audio reconstruction response
 */
export async function requestChatAudioReconstruction(
  chatId: string
): Promise<AudioReconstructionResponse> {
  try {
    const response = await fetch(`https://api.hume.ai/v0/evi/chats/${chatId}/audio`, {
      method: "GET",
      headers: {
        "X-Hume-Api-Key": process.env.HUME_API_KEY || "",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hume API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    logger.info({ chatId, status: data.status }, "Requested audio reconstruction");
    return data;
  } catch (error) {
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
        chatId,
      },
      "Error requesting chat audio reconstruction"
    );
    Sentry.captureException(error);
    throw error;
  }
}

/**
 * Request audio reconstruction for all chats in a chat group
 * @param chatGroupId The Hume chat group ID to reconstruct
 * @param pageNumber The page number to retrieve
 * @param pageSize The number of results per page
 * @param ascendingOrder Order results by ascending or descending
 * @returns Promise with audio reconstruction response for the chat group
 */
export async function requestChatGroupAudioReconstruction(
  chatGroupId: string,
  pageNumber = 1,
  pageSize = 10,
  ascendingOrder = false
): Promise<ChatGroupAudioReconstructionResponse> {
  try {
    const queryParams = new URLSearchParams({
      page_number: pageNumber.toString(),
      page_size: pageSize.toString(),
      ascending_order: ascendingOrder.toString(),
    });

    const response = await fetch(
      `https://api.hume.ai/v0/evi/chat_groups/${chatGroupId}/audio?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "X-Hume-Api-Key": process.env.HUME_API_KEY || "",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hume API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    logger.info(
      { chatGroupId, numChats: data.num_chats, status: "requested" },
      "Requested chat group audio reconstruction"
    );
    return data;
  } catch (error) {
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
        chatGroupId,
      },
      "Error requesting chat group audio reconstruction"
    );
    Sentry.captureException(error);
    throw error;
  }
}

/**
 * Poll for audio reconstruction status until complete or timeout
 * @param chatId The Hume chat ID to check
 * @param maxAttempts Maximum number of polling attempts
 * @param intervalMs Polling interval in milliseconds
 * @returns Promise with final audio reconstruction response
 */
export async function pollAudioReconstructionStatus(
  chatId: string,
  maxAttempts = 30,
  intervalMs = 5000
): Promise<AudioReconstructionResponse> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const reconstructionStatus = await requestChatAudioReconstruction(chatId);

    if (reconstructionStatus.status === "COMPLETE") {
      logger.info({ chatId }, "Audio reconstruction completed successfully");
      return reconstructionStatus;
    }

    if (reconstructionStatus.status === "ERROR" || reconstructionStatus.status === "CANCELED") {
      const error = new Error(
        `Audio reconstruction failed with status: ${reconstructionStatus.status}`
      );
      logger.error(
        {
          message: error.message,
          chatId,
          status: reconstructionStatus.status,
        },
        "Audio reconstruction failed"
      );
      throw error;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  const timeoutError = new Error(`Audio reconstruction timed out after ${maxAttempts} attempts`);
  logger.error({ message: timeoutError.message, chatId }, "Audio reconstruction timeout");
  throw timeoutError;
}

/**
 * Download audio file from signed URL and return as Buffer
 * @param signedUrl The signed URL to download
 * @returns Promise with Buffer containing the audio data
 */
export async function downloadAudioFile(signedUrl: string): Promise<Buffer> {
  try {
    const response = await fetch(signedUrl);

    if (!response.ok) {
      throw new Error(`Failed to download audio file: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      },
      "Error downloading audio file"
    );
    Sentry.captureException(error);
    throw error;
  }
}
