ALTER TABLE "reports" DROP CONSTRAINT "reports_interview_id_interviews_id_fk";
--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "interview_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "chat_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN IF EXISTS "interview_id";