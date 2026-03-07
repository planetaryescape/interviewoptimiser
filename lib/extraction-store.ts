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

export async function setExtractionResult(
  extractionId: string,
  result: ExtractionResult
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  await redis.set(`${EXTRACTION_PREFIX}${extractionId}`, JSON.stringify(result), {
    ex: EXTRACTION_TTL,
  });
}

export async function getExtractionResult(extractionId: string): Promise<ExtractionResult | null> {
  const redis = getRedis();
  if (!redis) return null;

  const result = await redis.get<string>(`${EXTRACTION_PREFIX}${extractionId}`);
  if (!result) return null;

  return typeof result === "string" ? JSON.parse(result) : (result as ExtractionResult);
}
