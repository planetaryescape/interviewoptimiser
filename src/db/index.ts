import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL as string;
const isDev = process.env.NODE_ENV === "development";

const client = postgres(connectionString, {
  max: isDev ? 1 : 10,
});

export const db = drizzle(client, { schema });
