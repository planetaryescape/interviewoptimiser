import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { fileExtractionCache } from "~/db/schema";
import { logger } from "~/lib/logger";

/**
 * Generate SHA-256 hash of file content
 * @param buffer File content as Buffer or ArrayBuffer
 * @returns Hex-encoded SHA-256 hash (64 characters)
 */
export function hashFileContent(buffer: Buffer | ArrayBuffer): string {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

/**
 * Check if file extraction is cached and return cached data
 * @param fileHash SHA-256 hash of the file
 * @returns Cached extraction data or null if not found
 */
export async function getCachedFileExtraction(fileHash: string): Promise<{
  extractedText: string;
  extractionType: string | null;
  hitCount: number;
} | null> {
  try {
    const cached = await db.query.fileExtractionCache.findFirst({
      where: eq(fileExtractionCache.fileHash, fileHash),
    });

    if (cached) {
      const hitCount = Number.parseInt(cached.hitCount) || 0;
      logger.info(
        { fileHash, hitCount: hitCount + 1, extractionType: cached.extractionType },
        "File extraction cache hit"
      );

      // Update the hitCount and updatedAt timestamp asynchronously
      // Don't await to avoid slowing down the response
      db.update(fileExtractionCache)
        .set({
          hitCount: (hitCount + 1).toString(),
          updatedAt: new Date(),
        })
        .where(eq(fileExtractionCache.fileHash, fileHash))
        .catch((error) => {
          logger.error({ error, fileHash }, "Error updating cache hit count");
        });

      return {
        extractedText: cached.extractedText,
        extractionType: cached.extractionType,
        hitCount: hitCount + 1,
      };
    }

    logger.info({ fileHash }, "File extraction cache miss");
    return null;
  } catch (error) {
    logger.error({ error, fileHash }, "Error checking file extraction cache");
    return null;
  }
}

/**
 * Store extracted file content in cache
 * @param params File extraction data to cache
 */
export async function setCachedFileExtraction(params: {
  fileHash: string;
  fileType: string;
  fileName?: string;
  fileSize: number;
  extractedText: string;
  extractionType?: "cv" | "job_description" | "general";
}): Promise<void> {
  try {
    await db.insert(fileExtractionCache).values({
      id: crypto.randomUUID(),
      fileHash: params.fileHash,
      fileType: params.fileType,
      fileName: params.fileName || null,
      fileSize: params.fileSize.toString(),
      extractedText: params.extractedText,
      extractionType: params.extractionType || "general",
      hitCount: "0",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    logger.info(
      {
        fileHash: params.fileHash,
        fileType: params.fileType,
        extractionType: params.extractionType,
        textLength: params.extractedText.length,
      },
      "File extraction cached successfully"
    );
  } catch (error) {
    // If there's a unique constraint violation, it means another request
    // cached it simultaneously - that's fine, we can ignore it
    if (error instanceof Error && error.message.includes("unique constraint")) {
      logger.info(
        { fileHash: params.fileHash },
        "File extraction already cached (race condition handled)"
      );
      return;
    }
    logger.error({ error, fileHash: params.fileHash }, "Error caching file extraction");
    // Don't throw - caching is optional, extraction should still work
  }
}

/**
 * Get cache statistics
 * @returns Cache statistics including total entries, hit rates, etc.
 */
export async function getCacheStatistics(): Promise<{
  totalEntries: number;
  totalHits: number;
  avgTextLength: number;
  byType: Record<string, number>;
}> {
  try {
    const entries = await db.query.fileExtractionCache.findMany();

    const stats = {
      totalEntries: entries.length,
      totalHits: entries.reduce((sum, entry) => sum + (Number.parseInt(entry.hitCount) || 0), 0),
      avgTextLength:
        entries.reduce((sum, entry) => sum + entry.extractedText.length, 0) / entries.length || 0,
      byType: entries.reduce(
        (acc, entry) => {
          const type = entry.extractionType || "unknown";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    return stats;
  } catch (error) {
    logger.error({ error }, "Error getting cache statistics");
    return {
      totalEntries: 0,
      totalHits: 0,
      avgTextLength: 0,
      byType: {},
    };
  }
}

/**
 * Clear old cache entries
 * @param olderThan Delete entries older than this many days (default: 30)
 * @returns Number of entries deleted
 */
export async function clearOldCacheEntries(olderThan = 30): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThan);

    // First, count how many will be deleted
    const toDelete = await db.query.fileExtractionCache.findMany({
      where: eq(fileExtractionCache.updatedAt, cutoffDate),
    });

    // Then delete them
    await db.delete(fileExtractionCache).where(eq(fileExtractionCache.updatedAt, cutoffDate));

    logger.info({ deleted: toDelete.length, olderThan }, "Cleared old cache entries");
    return toDelete.length;
  } catch (error) {
    logger.error({ error, olderThan }, "Error clearing old cache entries");
    return 0;
  }
}
