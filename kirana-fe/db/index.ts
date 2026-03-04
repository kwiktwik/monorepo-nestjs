import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type GlobalThisType<T> = typeof globalThis & T;

const connectionString = process.env.DATABASE_URL!;

const postgresClient =
  (
    globalThis as GlobalThisType<{
      postgresClient?: ReturnType<typeof postgres>;
    }>
  ).postgresClient ||
  postgres(connectionString, {
    max: 4, // per EC2 instance
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // required with Transaction pooler
  });

if (process.env.NODE_ENV !== "production") {
  (
    globalThis as GlobalThisType<{ postgresClient: typeof postgresClient }>
  ).postgresClient = postgresClient;
}

export const db = drizzle(postgresClient, { schema });
