CREATE TABLE IF NOT EXISTS "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"interview_id" integer NOT NULL,
	"general_assessment" text NOT NULL,
	"overall_score" integer NOT NULL,
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
	"actionable_next_steps" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reports_interview_id_unique" UNIQUE("interview_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
