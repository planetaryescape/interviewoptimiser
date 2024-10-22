ALTER TABLE "page_settings" ADD COLUMN "report_id" integer;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_settings" ADD CONSTRAINT "page_settings_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
