import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/(krafto)/drizzle/schema.ts",
  out: "./app/(krafto)/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.KWIKTWIK_DATABASE_URL!,
  },
});
