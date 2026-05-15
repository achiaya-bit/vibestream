import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { config } from "../config.js";

/** Project-root drizzle folder (meta/_journal.json + {tag}.sql files). */
const migrationsFolder = path.resolve(process.cwd(), "drizzle");

async function runMigrations() {
  console.log(`Applying migrations from: ${migrationsFolder}`);

  const pool = new pg.Pool({ connectionString: config.databaseUrl });

  try {
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder });
    console.log("PostgreSQL migrations applied successfully.");
  } finally {
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err instanceof Error ? err.message : err);
  console.error(`Connection: ${config.databaseUrl.replace(/:[^:@]+@/, ":****@")}`);
  console.error("Ensure PostgreSQL is running: docker compose up -d postgres");
  console.error("Generate migrations if missing: npm run db:generate");
  process.exit(1);
});
