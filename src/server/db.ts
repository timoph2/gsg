import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
let connection: ReturnType<typeof postgres> | undefined;
export function getDb() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is not configured");
  connection ??= postgres(process.env.DATABASE_URL, { max: 5, prepare: false });
  return drizzle(connection, { schema });
}
