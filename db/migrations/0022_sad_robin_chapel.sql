CREATE TABLE IF NOT EXISTS "job_descriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"interview_id" integer NOT NULL,
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
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_descriptions" ADD CONSTRAINT "job_descriptions_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_descriptions_interview_id_idx" ON "job_descriptions" USING btree ("interview_id");