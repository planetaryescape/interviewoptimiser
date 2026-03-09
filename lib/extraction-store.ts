import { Redis } from "@upstash/redis";
import { logger } from "~/lib/logger";

const EXTRACTION_PREFIX = "extraction:";
const EXTRACTION_TTL = 300; // 5 minutes

export interface ExtractionResult {
  status: "pending" | "completed" | "error";
  extractedText?: string;
  fileName?: string;
  fileType?: string;
  url?: string;
  characterCount?: number;
  cached?: boolean;
  error?: string;
}

function getRedis(): Redis | null {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    logger.warn("Redis not configured for extraction store");
    return null;
  }
  return Redis.fromEnv();
}

/** Stores an extraction result in Redis cache. Best-effort: silently continues if Redis is unreachable. */
export async function setExtractionResult(
  extractionId: string,
  result: ExtractionResult
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set(`${EXTRACTION_PREFIX}${extractionId}`, JSON.stringify(result), {
      ex: EXTRACTION_TTL,
    });
  } catch (error) {
    logger.warn(
      { error, extractionId },
      "Failed to set extraction result in Redis, continuing without cache"
    );
  }
}

/** Retrieves an extraction result from Redis cache. Returns null if Redis is unreachable or key is missing. */
export async function getExtractionResult(extractionId: string): Promise<ExtractionResult | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const result = await redis.get<string>(`${EXTRACTION_PREFIX}${extractionId}`);
    if (!result) return null;

    return JSON.parse(result) as ExtractionResult;
  } catch (error) {
    logger.warn(
      { error, extractionId },
      "Failed to get extraction result from Redis, returning null"
    );
    return null;
  }
}
