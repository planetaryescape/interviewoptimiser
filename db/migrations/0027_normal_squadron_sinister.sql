ALTER TABLE "chat_metadata" DROP CONSTRAINT "chat_metadata_interview_id_interviews_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_metadata" ADD COLUMN "report_id" integer;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "interview_audio_url" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_metadata" ADD CONSTRAINT "chat_metadata_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "chat_metadata" DROP COLUMN IF EXISTS "interview_id";--> statement-breakpoint
ALTER TABLE "interviews" DROP COLUMN IF EXISTS "interview_audio_url";