DO $$ BEGIN
 CREATE TYPE "public"."feature_request_status" AS ENUM('submitted', 'triaged', 'in_progress', 'completed', 'declined');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."margin_size" AS ENUM('Normal', 'Narrow', 'Wide');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."paper_size" AS ENUM('A4', 'Letter', 'Legal');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('user', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "changelogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"iso_code" varchar(2) NOT NULL,
	"continent" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "countries_iso_code_unique" UNIQUE("iso_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customisations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"custom_instructions" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cvs" (
	"id" serial PRIMARY KEY NOT NULL,
	"optimization_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"location" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"page_settings_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "educations" (
	"id" serial PRIMARY KEY NOT NULL,
	"cv_id" integer NOT NULL,
	"degree" varchar(255) NOT NULL,
	"school" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"start_date" varchar(255) NOT NULL,
	"end_date" varchar(255),
	"current" boolean DEFAULT false NOT NULL,
	"order" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"cv_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"company" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"start_date" varchar(255) NOT NULL,
	"end_date" varchar(255),
	"current" boolean DEFAULT false NOT NULL,
	"description" text NOT NULL,
	"order" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feature_request_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"feature_request_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feature_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"status" "feature_request_status" DEFAULT 'submitted' NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"optimization_id" integer NOT NULL,
	"content" text NOT NULL,
	"completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"cloudinary_public_id" varchar NOT NULL,
	"url" varchar NOT NULL,
	"format" varchar NOT NULL,
	"original_filename" varchar NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "images_cloudinary_public_id_unique" UNIQUE("cloudinary_public_id"),
	CONSTRAINT "images_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "links" (
	"id" serial PRIMARY KEY NOT NULL,
	"cv_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "optimizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"submitted_cv_text" text NOT NULL,
	"job_description_text" text NOT NULL,
	"additional_info" text,
	"is_cv_complete" boolean DEFAULT false,
	"is_cover_letter_complete" boolean DEFAULT false,
	"cv_error" boolean DEFAULT false,
	"cover_letter_error" boolean DEFAULT false,
	"score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"candidate" text,
	"company" text,
	"role" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"paper_size" "paper_size" NOT NULL,
	"heading_font" varchar(255) NOT NULL,
	"body_font" varchar(255) NOT NULL,
	"margin_size" "margin_size" NOT NULL,
	"layout" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sections_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"optimization_id" integer NOT NULL,
	"experiences" integer NOT NULL,
	"educations" integer NOT NULL,
	"skills" integer NOT NULL,
	"links" integer NOT NULL,
	"custom_sections" integer NOT NULL,
	"summary" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sections_order_optimization_id_unique" UNIQUE("optimization_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"cv_id" integer NOT NULL,
	"skill" varchar(255) NOT NULL,
	"order" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar NOT NULL,
	"firstname" varchar,
	"lastname" varchar,
	"role" "role" DEFAULT 'user' NOT NULL,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"stripe_subscription_interval" varchar,
	"stripe_price_id" varchar,
	"stripe_plan_id" varchar,
	"trial_used" boolean DEFAULT false,
	"is_deleted" boolean DEFAULT false,
	"clerk_user_id" varchar,
	"email" varchar NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"credits" integer DEFAULT 10 NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customisations" ADD CONSTRAINT "customisations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cvs" ADD CONSTRAINT "cvs_optimization_id_optimizations_id_fk" FOREIGN KEY ("optimization_id") REFERENCES "public"."optimizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cvs" ADD CONSTRAINT "cvs_page_settings_id_page_settings_id_fk" FOREIGN KEY ("page_settings_id") REFERENCES "public"."page_settings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "educations" ADD CONSTRAINT "educations_cv_id_cvs_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."cvs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "experiences" ADD CONSTRAINT "experiences_cv_id_cvs_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."cvs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feature_request_likes" ADD CONSTRAINT "feature_request_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feature_request_likes" ADD CONSTRAINT "feature_request_likes_feature_request_id_feature_requests_id_fk" FOREIGN KEY ("feature_request_id") REFERENCES "public"."feature_requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feature_requests" ADD CONSTRAINT "feature_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_optimization_id_optimizations_id_fk" FOREIGN KEY ("optimization_id") REFERENCES "public"."optimizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "links" ADD CONSTRAINT "links_cv_id_cvs_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."cvs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "optimizations" ADD CONSTRAINT "optimizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sections_order" ADD CONSTRAINT "sections_order_optimization_id_optimizations_id_fk" FOREIGN KEY ("optimization_id") REFERENCES "public"."optimizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "skills" ADD CONSTRAINT "skills_cv_id_cvs_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."cvs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "educations_cv_id_idx" ON "educations" USING btree ("cv_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "experiences_cv_id_idx" ON "experiences" USING btree ("cv_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "images_prompt_id_idx" ON "images" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "links_cv_id_idx" ON "links" USING btree ("cv_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "skills_cv_id_idx" ON "skills" USING btree ("cv_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "users" USING btree ("email");