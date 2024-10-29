CREATE TABLE IF NOT EXISTS "statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"interviews_count" integer NOT NULL,
	"minutes_count" integer NOT NULL,
	"users_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
