import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL as string;
const isDev = process.env.NODE_ENV === "development";

export const db = drizzle({
  connection: {
    url: connectionString,
    max: isDev ? 1 : undefined,
    timeout: 10000, // 10 seconds
  },
  schema,
  casing: "snake_case",
});
