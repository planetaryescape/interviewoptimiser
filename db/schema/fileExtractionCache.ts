import { index, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * File Extraction Cache Table
 * Stores extracted text content indexed by file hash to avoid redundant AI processing
 * Works for CVs, job descriptions, and any other uploaded documents
 */
export const fileExtractionCache = pgTable(
  "file_extraction_cache",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    // SHA-256 hash of the file content (64 hex characters)
    fileHash: varchar("file_hash", { length: 64 }).notNull().unique(),
    // File MIME type (e.g., "application/pdf", "application/msword")
    fileType: varchar("file_type", { length: 100 }).notNull(),
    // Original filename (for debugging/tracking)
    fileName: varchar("file_name", { length: 255 }),
    // File size in bytes
    fileSize: varchar("file_size", { length: 20 }).notNull(),
    // Extracted text content
    extractedText: text("extracted_text").notNull(),
    // Document type hint (cv, job_description, general)
    extractionType: varchar("extraction_type", { length: 50 }),
    // How many times this cached entry has been reused
    hitCount: varchar("hit_count", { length: 10 }).notNull().default("0"),
    // When the cache entry was created
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    // When the cache entry was last accessed
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("file_extraction_cache_file_hash_idx").on(table.fileHash),
    index("file_extraction_cache_created_at_idx").on(table.createdAt),
    index("file_extraction_cache_extraction_type_idx").on(table.extractionType),
  ]
);

export type FileExtractionCache = typeof fileExtractionCache.$inferSelect;
export type NewFileExtractionCache = typeof fileExtractionCache.$inferInsert;
