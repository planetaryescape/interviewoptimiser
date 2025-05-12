CREATE TYPE "public"."feature_request_status" AS ENUM('submitted', 'triaged', 'in_progress', 'completed', 'declined');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'rejected', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."interview_type" AS ENUM('behavioral', 'situational', 'technical', 'case_study', 'competency_based', 'stress', 'cultural_fit');--> statement-breakpoint
CREATE TYPE "public"."margin_size" AS ENUM('Normal', 'Narrow', 'Wide');--> statement-breakpoint
CREATE TYPE "public"."paper_size" AS ENUM('A4', 'Letter', 'Legal');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'recruiter');--> statement-breakpoint
CREATE TABLE "candidate_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"location" text,
	"current_role" text,
	"professional_summary" text,
	"linkedin_url" text,
	"portfolio_url" text,
	"other_urls" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "changelogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"custom_session_id" text,
	"transcript" text,
	"chat_group_id" text NOT NULL,
	"hume_chat_id" text NOT NULL,
	"request_id" text,
	"actual_time" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chats_humeChatId_unique" UNIQUE("hume_chat_id"),
	CONSTRAINT "chats_requestId_unique" UNIQUE("request_id")
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"iso_code" varchar(2) NOT NULL,
	"continent" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "countries_isoCode_unique" UNIQUE("iso_code")
);
--> statement-breakpoint
CREATE TABLE "customisations" (
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
CREATE TABLE "feature_request_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"feature_request_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"status" "feature_request_status" DEFAULT 'submitted' NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"prompt_id" integer NOT NULL,
	"cloudinary_public_id" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"format" varchar(255) NOT NULL,
	"original_filename" varchar(255) NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "images_cloudinaryPublicId_unique" UNIQUE("cloudinary_public_id"),
	CONSTRAINT "images_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"organization_id" integer NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_descriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"company" text,
	"role" text,
	"required_qualifications" text[],
	"required_experience" text[],
	"required_skills" text[],
	"preferred_qualifications" text[],
	"preferred_skills" text[],
	"responsibilities" text[],
	"benefits" text[],
	"location" text,
	"employment_type" text,
	"seniority" text,
	"industry" text,
	"key_technologies" text[],
	"keywords" text[],
	"key_questions" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"submitted_cv_text" text NOT NULL,
	"job_description_text" text NOT NULL,
	"additional_info" text,
	"duration" integer DEFAULT 15 NOT NULL,
	"actual_time" integer,
	"type" "interview_type" DEFAULT 'behavioral' NOT NULL,
	"candidate" text,
	"company" text,
	"role" text,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" serial NOT NULL,
	"user_id" serial NOT NULL,
	"role" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1000),
	"website" varchar(255),
	"industry" varchar(255),
	"size" varchar(50),
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer,
	"paper_size" "paper_size" NOT NULL,
	"heading_font" varchar(255) NOT NULL,
	"body_font" varchar(255) NOT NULL,
	"margin_size" "margin_size" NOT NULL,
	"layout" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"question" text NOT NULL,
	"analysis" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"is_key_question" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"general_assessment" text NOT NULL,
	"overall_score" integer NOT NULL,
	"fitness_for_role" text DEFAULT '' NOT NULL,
	"fitness_for_role_score" integer DEFAULT 0 NOT NULL,
	"speaking_skills" text NOT NULL,
	"speaking_skills_score" integer NOT NULL,
	"communication_skills" text NOT NULL,
	"communication_skills_score" integer NOT NULL,
	"problem_solving_skills" text NOT NULL,
	"problem_solving_skills_score" integer NOT NULL,
	"technical_knowledge" text NOT NULL,
	"technical_knowledge_score" integer NOT NULL,
	"teamwork" text NOT NULL,
	"teamwork_score" integer NOT NULL,
	"adaptability" text NOT NULL,
	"adaptability_score" integer NOT NULL,
	"areas_of_strength" text NOT NULL,
	"areas_for_improvement" text NOT NULL,
	"interview_audio_url" text,
	"actionable_next_steps" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"image_url" varchar(255),
	"twitter_username" varchar(255),
	"linkedin_url" varchar(255),
	"show_on_landing" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"interviews_count" integer NOT NULL,
	"minutes_count" integer NOT NULL,
	"users_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"firstname" varchar(255),
	"lastname" varchar(255),
	"role" "role" DEFAULT 'user' NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"stripe_subscription_interval" varchar(255),
	"stripe_price_id" varchar(255),
	"stripe_plan_id" varchar(255),
	"trial_used" boolean DEFAULT false,
	"is_deleted" boolean DEFAULT false,
	"clerk_user_id" varchar(255),
	"email" varchar(255) NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"minutes" integer DEFAULT 2 NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "candidate_details" ADD CONSTRAINT "candidate_details_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "customisations" ADD CONSTRAINT "customisations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_request_likes" ADD CONSTRAINT "feature_request_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_request_likes" ADD CONSTRAINT "feature_request_likes_feature_request_id_feature_requests_id_fk" FOREIGN KEY ("feature_request_id") REFERENCES "public"."feature_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_requests" ADD CONSTRAINT "feature_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_prompt_id_users_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_descriptions" ADD CONSTRAINT "job_descriptions_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_settings" ADD CONSTRAINT "page_settings_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_analysis" ADD CONSTRAINT "question_analysis_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "candidate_details_job_id_idx" ON "candidate_details" USING btree ("job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "changelogs_date_idx" ON "changelogs" USING btree ("date");--> statement-breakpoint
CREATE INDEX "chats_job_id_idx" ON "chats" USING btree ("job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "countries_iso_code_idx" ON "countries" USING btree ("iso_code");--> statement-breakpoint
CREATE UNIQUE INDEX "customisations_user_id_idx" ON "customisations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feature_request_likes_user_id_idx" ON "feature_request_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feature_request_likes_feature_request_id_idx" ON "feature_request_likes" USING btree ("feature_request_id");--> statement-breakpoint
CREATE UNIQUE INDEX "feature_request_likes_user_feature_request_uidx" ON "feature_request_likes" USING btree ("user_id","feature_request_id");--> statement-breakpoint
CREATE INDEX "feature_requests_user_id_idx" ON "feature_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "images_prompt_id_idx" ON "images" USING btree ("prompt_id");--> statement-breakpoint
CREATE UNIQUE INDEX "images_cloudinary_public_id_idx" ON "images" USING btree ("cloudinary_public_id");--> statement-breakpoint
CREATE INDEX "invitations_organization_id_idx" ON "invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invitations_status_idx" ON "invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_descriptions_job_id_idx" ON "job_descriptions" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "jobs_user_id_idx" ON "jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "organization_members_organization_id_idx" ON "organization_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_members_user_id_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "organization_members_active_idx" ON "organization_members" USING btree ("organization_id","user_id","is_active");--> statement-breakpoint
CREATE INDEX "organizations_name_idx" ON "organizations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "organizations_is_deleted_idx" ON "organizations" USING btree ("is_deleted");--> statement-breakpoint
CREATE UNIQUE INDEX "page_settings_report_id_idx" ON "page_settings" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "question_analysis_report_id_idx" ON "question_analysis" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "reports_chat_id_idx" ON "reports" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "reviews_user_id_idx" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_show_on_landing_idx" ON "reviews" USING btree ("show_on_landing");--> statement-breakpoint
CREATE INDEX "reviews_is_published_idx" ON "reviews" USING btree ("is_published");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_stripe_customer_id_idx" ON "users" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_user_id_idx" ON "users" USING btree ("clerk_user_id");