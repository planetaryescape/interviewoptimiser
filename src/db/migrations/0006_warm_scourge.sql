ALTER TABLE "reports" ADD COLUMN "fitness_for_role" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "fitness_for_role_score" integer DEFAULT 0 NOT NULL;