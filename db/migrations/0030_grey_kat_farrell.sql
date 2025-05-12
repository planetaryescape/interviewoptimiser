ALTER TABLE "chat_metadata" RENAME TO "chats";--> statement-breakpoint
ALTER TABLE "chats" DROP CONSTRAINT "chat_metadata_report_id_reports_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "chat_metadata_report_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "reports_interview_id_idx";--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "interview_id" integer;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "chat_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats" ADD CONSTRAINT "chats_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chats_interview_id_idx" ON "chats" USING btree ("interview_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_chat_id_idx" ON "reports" USING btree ("chat_id");--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN IF EXISTS "report_id";