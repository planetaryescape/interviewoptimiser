ALTER TABLE "interviews" ADD COLUMN "duration" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "type" "interview_type" DEFAULT 'behavioral' NOT NULL;