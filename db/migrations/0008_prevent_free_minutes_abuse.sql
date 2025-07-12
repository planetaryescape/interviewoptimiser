-- Create deleted_users table to track previously deleted accounts
CREATE TABLE IF NOT EXISTS "deleted_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email_hash" varchar(64) NOT NULL,
	"deleted_at" timestamp DEFAULT now() NOT NULL,
	"clerk_user_id" varchar(255),
	"has_used_free_minutes" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "deleted_users_email_hash_idx" ON "deleted_users" USING btree ("email_hash");