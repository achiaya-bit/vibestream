import "dotenv/config";
import { defineConfig, type Config } from "drizzle-kit";

function databaseUrl(): string {
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL.trim();
  const user = encodeURIComponent(process.env.DB_USER ?? "vibestream");
  const password = encodeURIComponent(process.env.DB_PASSWORD ?? "vibestream");
  const host = process.env.DB_HOST ?? "localhost";
  const port = process.env.DB_PORT ?? "5432";
  const name = process.env.DB_NAME ?? "vibestream";
  return `postgresql://${user}:${password}@${host}:${port}/${name}`;
}

const drizzleConfig = {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl() },
} satisfies Config;

export default defineConfig(drizzleConfig);
