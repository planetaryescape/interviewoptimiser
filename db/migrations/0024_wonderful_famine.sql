CREATE TABLE IF NOT EXISTS "question_analysis" (
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
DO $$ BEGIN
 ALTER TABLE "question_analysis" ADD CONSTRAINT "question_analysis_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_analysis_report_id_idx" ON "question_analysis" USING btree ("report_id");