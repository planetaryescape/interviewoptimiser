ALTER TABLE "images" RENAME COLUMN "user_id" TO "prompt_id";--> statement-breakpoint
ALTER TABLE "countries" DROP CONSTRAINT "countries_iso_code_unique";--> statement-breakpoint
ALTER TABLE "images" DROP CONSTRAINT "images_cloudinary_public_id_unique";--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_interview_id_unique";--> statement-breakpoint
ALTER TABLE "images" DROP CONSTRAINT "images_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "username_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "email_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "images_prompt_id_idx";--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "cloudinary_public_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "url" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "format" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "original_filename" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "firstname" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "lastname" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "stripe_customer_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "stripe_subscription_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "stripe_subscription_interval" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "stripe_price_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "stripe_plan_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "clerk_user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(255);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_prompt_id_users_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "changelogs_date_idx" ON "changelogs" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "countries_iso_code_idx" ON "countries" USING btree ("iso_code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "customisations_user_id_idx" ON "customisations" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "feature_request_likes_user_id_idx" ON "feature_request_likes" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "feature_request_likes_feature_request_id_idx" ON "feature_request_likes" USING btree ("feature_request_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "images_cloudinary_public_id_idx" ON "images" USING btree ("cloudinary_public_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interviews_user_id_idx" ON "interviews" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "page_settings_report_id_idx" ON "page_settings" USING btree ("report_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "reports_interview_id_idx" ON "reports" USING btree ("interview_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_stripe_customer_id_idx" ON "users" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_clerk_user_id_idx" ON "users" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "images_prompt_id_idx" ON "images" USING btree ("prompt_id");--> statement-breakpoint
ALTER TABLE "countries" ADD CONSTRAINT "countries_isoCode_unique" UNIQUE("iso_code");--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_cloudinaryPublicId_unique" UNIQUE("cloudinary_public_id");--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_interviewId_unique" UNIQUE("interview_id");