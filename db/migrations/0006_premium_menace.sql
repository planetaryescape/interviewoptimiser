DO $$ BEGIN
 ALTER TABLE "job_descriptions" ADD CONSTRAINT "job_descriptions_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
