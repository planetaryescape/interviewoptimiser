import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { logger } from "~/lib/logger";

const s3 = new S3Client({ region: process.env.AWS_REGION });

const AUDIO_BUCKET_NAME = process.env.AUDIO_BUCKET_NAME || "";
const CLOUDFRONT_DOMAIN = process.env.AUDIO_CDN_DOMAIN || "";

/**
 * Extract file extension and content type from filename
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
