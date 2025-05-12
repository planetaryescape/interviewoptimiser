import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "db/schema/index.ts",
  dialect: "postgresql",
  out: "db/migrations",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  verbose: true,
  strict: true,
  migrations: {
    schema: "public",
  },
});
