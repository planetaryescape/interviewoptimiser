import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { logger } from "~/lib/logger";

// Initialize AWS clients
export const s3 = new S3Client({ region: process.env.AWS_REGION });

// Constants
export const AUDIO_BUCKET_NAME = process.env.AUDIO_BUCKET_NAME || "";
export const CLOUDFRONT_DOMAIN = process.env.AUDIO_CDN_DOMAIN || "";
export const MAX_POLL_ATTEMPTS = 20; // Maximum number of polling attempts
export const POLL_INTERVAL_MS = 10000; // 10 seconds between polling attempts

/**
 * Request audio reconstruction for a specific chat
 * @param chatId The Hume chat ID to reconstruct
 * @returns Promise with audio reconstruction response
 */
export async function requestChatAudioReconstruction(chatId: string): Promise<any> {
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
  maxAttempts = MAX_POLL_ATTEMPTS,
  intervalMs = POLL_INTERVAL_MS
): Promise<any> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const reconstructionResponse = await requestChatAudioReconstruction(chatId);

    if (reconstructionResponse.status === "COMPLETE") {
      logger.info({ chatId }, "Audio reconstruction completed successfully");
      return reconstructionResponse;
    }

    if (reconstructionResponse.status === "ERROR" || reconstructionResponse.status === "CANCELED") {
      const error = new Error(
        `Audio reconstruction failed with status: ${reconstructionResponse.status}`
      );
      logger.error(
        {
          message: error.message,
          chatId,
          status: reconstructionResponse.status,
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
 * Download audio file from signed URL
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
    throw error;
  }
}

/**
 * Extract file extension and content type from filename
 * @param filename The filename to analyze
 * @returns Object containing extension and content type
 */
export function getFileTypeFromFilename(filename: string): {
  extension: string;
  contentType: string;
} {
  const extension = filename.split(".").pop();

  if (!extension) {
    throw new Error("No file extension found");
  }

  switch (extension.toLowerCase()) {
    case "mp4":
      return { extension: "mp4", contentType: "video/mp4" };
    case "mp3":
      return { extension: "mp3", contentType: "audio/mpeg" };
    case "wav":
      return { extension: "wav", contentType: "audio/wav" };
    case "ogg":
      return { extension: "ogg", contentType: "audio/ogg" };
    case "m4a":
      return { extension: "m4a", contentType: "audio/mp4" };
    case "aac":
      return { extension: "aac", contentType: "audio/aac" };
    case "webm":
      return { extension: "webm", contentType: "audio/webm" };
    case "flac":
      return { extension: "flac", contentType: "audio/flac" };
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

/**
 * Upload audio file to S3
 * @param audioData Buffer containing the audio data
 * @param key The S3 key (path) for the audio file
 * @param filename The original filename from Hume API
 * @returns CloudFront URL for the uploaded audio
 */
export async function uploadAudioToS3(
  audioData: Buffer,
  chatId: string,
  filename: string
): Promise<string> {
  try {
    const { extension, contentType } = getFileTypeFromFilename(filename);
    const key = `interview-recordings/${chatId}.${extension}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: AUDIO_BUCKET_NAME,
        Key: key,
        Body: audioData,
        ContentType: contentType,
      })
    );

    // Generate CloudFront URL
    const cloudFrontUrl = `https://${CLOUDFRONT_DOMAIN}/${key}`;
    return cloudFrontUrl;
  } catch (error) {
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
        chatId,
      },
      "Error uploading audio to S3"
    );
    throw error;
  }
}
