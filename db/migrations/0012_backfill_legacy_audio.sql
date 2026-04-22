UPDATE "reports"
SET "audio_save_skipped_reason" = 'legacy-backfill'
WHERE "interview_audio_url" IS NULL
  AND "audio_save_skipped_reason" IS NULL
  AND "created_at" < now() - interval '7 days';
