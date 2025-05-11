DROP INDEX IF EXISTS "feature_request_likes_user_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "feature_request_likes_feature_request_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "images_prompt_id_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_metadata_report_id_idx" ON "chat_metadata" USING btree ("report_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "feature_request_likes_user_feature_request_uidx" ON "feature_request_likes" USING btree ("user_id","feature_request_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feature_requests_user_id_idx" ON "feature_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitations_organization_id_idx" ON "invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitations_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitations_status_idx" ON "invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_candidates_job_id_idx" ON "job_candidates" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_candidates_user_id_idx" ON "job_candidates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_candidates_status_idx" ON "job_candidates" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "job_candidates_job_user_uidx" ON "job_candidates" USING btree ("job_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "jobs_organization_id_idx" ON "jobs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "jobs_created_by_id_idx" ON "jobs" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "jobs_status_idx" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "jobs_is_deleted_idx" ON "jobs" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "jobs_org_active_idx" ON "jobs" USING btree ("organization_id","is_deleted");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_members_organization_id_idx" ON "organization_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_members_user_id_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_members_active_idx" ON "organization_members" USING btree ("organization_id","user_id","is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organizations_name_idx" ON "organizations" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organizations_is_deleted_idx" ON "organizations" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feature_request_likes_user_id_idx" ON "feature_request_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feature_request_likes_feature_request_id_idx" ON "feature_request_likes" USING btree ("feature_request_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "images_prompt_id_idx" ON "images" USING btree ("prompt_id");