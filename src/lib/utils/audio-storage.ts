import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { v4 as uuidv4 } from "uuid";
import { logger } from "~/lib/logger";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

const BUCKET_NAME = process.env.AUDIO_BUCKET_NAME || "";
const CLOUDFRONT_DOMAIN = process.env.AUDIO_CDN_DOMAIN || "";
const CLOUDFRONT_KEY_PAIR_ID = process.env.CLOUDFRONT_KEY_PAIR_ID || "";
const CLOUDFRONT_PRIVATE_KEY = process.env.CLOUDFRONT_PRIVATE_KEY || "";

/**
 * Uploads an audio recording to S3
 * @param audioData Buffer or binary data of the audio recording
 * @param fileType The MIME type of the audio file (e.g., 'audio/wav')
 * @param interviewId The ID of the interview associated with the recording
 * @returns Object containing the S3 key and CloudFront URL
 */
export async function uploadAudioRecording(
  audioData: Buffer,
  fileType: string,
  interviewId: number
): Promise<{ key: string; url: string }> {
  try {
    // Generate a unique filename
    const extension = fileType.includes("wav") ? "wav" : "mp3";
    const key = `recordings/${interviewId}/${uuidv4()}.${extension}`;

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: audioData,
        ContentType: fileType,
        Metadata: {
          interviewId: interviewId.toString(),
        },
      })
    );

    // Generate CloudFront URL
    const url = generateCloudFrontUrl(key);

    logger.info({ interviewId, key }, "Successfully uploaded audio recording");
    return { key, url };
  } catch (error) {
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
        interviewId,
      },
      "Error uploading audio recording"
    );
    throw new Error("Failed to upload audio recording");
  }
}

/**
 * Deletes an audio recording from S3
 * @param key The S3 key of the audio recording to delete
 */
export async function deleteAudioRecording(key: string): Promise<void> {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
    logger.info({ key }, "Successfully deleted audio recording");
  } catch (error) {
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
        key,
      },
      "Error deleting audio recording"
    );
    throw new Error("Failed to delete audio recording");
  }
}

/**
 * Generates a signed CloudFront URL for an audio recording
 * @param key The S3 key of the audio recording
 * @param expiresIn Time in seconds until the URL expires (default 24 hours)
 * @returns Signed CloudFront URL
 */
export function generateCloudFrontUrl(key: string, expiresIn = 86400): string {
  if (!CLOUDFRONT_DOMAIN || !CLOUDFRONT_KEY_PAIR_ID || !CLOUDFRONT_PRIVATE_KEY) {
    logger.warn("CloudFront configuration missing, falling back to direct S3 URL");
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
  }

  try {
    const url = `https://${CLOUDFRONT_DOMAIN}/${key}`;
    const expiration = new Date(Date.now() + expiresIn * 1000);

    const signedUrl = getSignedUrl({
      url,
      keyPairId: CLOUDFRONT_KEY_PAIR_ID,
      privateKey: CLOUDFRONT_PRIVATE_KEY,
      dateLessThan: expiration.toISOString(),
    });

    return signedUrl;
  } catch (error) {
    logger.error(
      {
        message: error instanceof Error ? error.message : "Unknown error",
        error,
        key,
      },
      "Error generating signed CloudFront URL"
    );
    return `https://${CLOUDFRONT_DOMAIN}/${key}`;
  }
}

/**
 * Checks if CloudFront is properly configured
 * @returns Boolean indicating if CloudFront is configured
 */
export function isCloudFrontConfigured(): boolean {
  return Boolean(CLOUDFRONT_DOMAIN && CLOUDFRONT_KEY_PAIR_ID && CLOUDFRONT_PRIVATE_KEY);
}
