ALTER TABLE "chats" RENAME TO "interviews";--> statement-breakpoint
ALTER TABLE "reports" RENAME COLUMN "chat_id" TO "interview_id";--> statement-breakpoint
ALTER TABLE "interviews" DROP CONSTRAINT "chats_humeChatId_unique";--> statement-breakpoint
ALTER TABLE "interviews" DROP CONSTRAINT "chats_requestId_unique";--> statement-breakpoint
ALTER TABLE "interviews" DROP CONSTRAINT "chats_job_id_jobs_id_fk";
--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_chat_id_chats_id_fk";
--> statement-breakpoint
DROP INDEX "chats_job_id_idx";--> statement-breakpoint
DROP INDEX "reports_chat_id_idx";--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "interviews_job_id_idx" ON "interviews" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "reports_interview_id_idx" ON "reports" USING btree ("interview_id");--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_humeChatId_unique" UNIQUE("hume_chat_id");--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_requestId_unique" UNIQUE("request_id");