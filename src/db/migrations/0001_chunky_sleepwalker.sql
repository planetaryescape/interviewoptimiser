CREATE TABLE IF NOT EXISTS "custom_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"cv_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"order" serial NOT NULL
);
--> statement-breakpoint
ALTER TABLE "optimizations" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_sections" ADD CONSTRAINT "custom_sections_cv_id_cvs_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."cvs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "custom_sections_cv_id_idx" ON "custom_sections" USING btree ("cv_id");