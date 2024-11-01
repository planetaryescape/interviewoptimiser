DROP INDEX IF EXISTS "reports_interview_id_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_interview_id_idx" ON "reports" USING btree ("interview_id");