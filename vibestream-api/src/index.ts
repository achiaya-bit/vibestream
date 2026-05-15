import { createApp } from "./app.js";
import { config } from "./config.js";
import { closeDb, verifyDbConnection } from "./db/index.js";
import { ensureMinioBucketsWithRetry } from "./storage/minio.js";

const app = createApp();

async function start() {
  try {
    await verifyDbConnection();
    console.log("PostgreSQL connected.");
  } catch (err) {
    console.error("Failed to connect to PostgreSQL.");
    console.error(`URL: ${config.databaseUrl.replace(/:[^:@]+@/, ":****@")}`);
    console.error(err);
    console.error("\nStart Postgres: docker compose up -d postgres");
    console.error("Then run: npm run db:setup\n");
    process.exit(1);
  }

  try {
    await ensureMinioBucketsWithRetry();
    console.log(`MinIO connected (${config.minio.url}).`);
    console.log(`  Buckets: ${config.minio.bucketSongs}, ${config.minio.bucketCovers}`);
  } catch (err) {
    console.error("Failed to connect to MinIO.");
    console.error(`Endpoint: ${config.minio.url}`);
    console.error(err);
    console.error("\nStart MinIO: docker compose up -d minio\n");
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(`VibeStream API listening on http://localhost:${config.port}`);
    console.log(`  Health: http://localhost:${config.port}/health`);
    console.log(`  API:    http://localhost:${config.port}/api`);
  });

  const shutdown = async () => {
    server.close();
    await closeDb();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start();
