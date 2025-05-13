ALTER TABLE "candidate_details" DROP CONSTRAINT "candidate_details_job_id_jobs_id_fk";
--> statement-breakpoint
ALTER TABLE "customisations" DROP CONSTRAINT "customisations_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "question_analysis" DROP CONSTRAINT "question_analysis_report_id_reports_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "candidate_details" ADD CONSTRAINT "candidate_details_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customisations" ADD CONSTRAINT "customisations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_analysis" ADD CONSTRAINT "question_analysis_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "duration";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "actual_time";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "type";