CREATE TABLE "deleted_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email_hash" varchar(64) NOT NULL,
	"deleted_at" timestamp NOT NULL,
	"clerk_user_id" varchar(255),
	"has_used_free_minutes" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "deleted_users_email_hash_idx" ON "deleted_users" USING btree ("email_hash");--> statement-breakpoint
CREATE INDEX "interviews_job_created_idx" ON "interviews" USING btree ("job_id","created_at");--> statement-breakpoint
CREATE INDEX "reports_is_completed_idx" ON "reports" USING btree ("is_completed");