ALTER TABLE "jobs" ALTER COLUMN "organization_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "is_shared" boolean DEFAULT false NOT NULL;