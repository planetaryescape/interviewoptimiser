CREATE TABLE IF NOT EXISTS "candidate_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"interview_id" integer NOT NULL,
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
DO $$ BEGIN
 ALTER TABLE "candidate_details" ADD CONSTRAINT "candidate_details_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "candidate_details_interview_id_idx" ON "candidate_details" USING btree ("interview_id");