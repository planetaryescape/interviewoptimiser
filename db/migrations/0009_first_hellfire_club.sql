CREATE TABLE "file_extraction_cache" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"file_hash" varchar(64) NOT NULL,
	"file_type" varchar(100) NOT NULL,
	"file_name" varchar(255),
	"file_size" varchar(20) NOT NULL,
	"extracted_text" text NOT NULL,
	"extraction_type" varchar(50),
	"hit_count" varchar(10) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "file_extraction_cache_file_hash_unique" UNIQUE("file_hash")
);
--> statement-breakpoint
ALTER TABLE "interviews" DROP CONSTRAINT "interviews_humeChatId_unique";--> statement-breakpoint
ALTER TABLE "interviews" DROP CONSTRAINT "interviews_requestId_unique";--> statement-breakpoint
ALTER TABLE "interviews" ALTER COLUMN "chat_group_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "interviews" ALTER COLUMN "hume_chat_id" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "file_extraction_cache_file_hash_idx" ON "file_extraction_cache" USING btree ("file_hash");--> statement-breakpoint
CREATE INDEX "file_extraction_cache_created_at_idx" ON "file_extraction_cache" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "file_extraction_cache_extraction_type_idx" ON "file_extraction_cache" USING btree ("extraction_type");