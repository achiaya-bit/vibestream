import "dotenv/config";

function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }

  const host = process.env.DB_HOST ?? "localhost";
  const port = process.env.DB_PORT ?? "5432";
  const user = encodeURIComponent(process.env.DB_USER ?? "vibestream");
  const password = encodeURIComponent(process.env.DB_PASSWORD ?? "vibestream");
  const name = process.env.DB_NAME ?? "vibestream";

  return `postgresql://${user}:${password}@${host}:${port}/${name}`;
}

function buildMinioUrl(): string {
  const useSsl = process.env.MINIO_USE_SSL === "true";
  const host = process.env.MINIO_ENDPOINT ?? "localhost";
  const port = process.env.MINIO_PORT ?? "9000";
  return `${useSsl ? "https" : "http"}://${host}:${port}`;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: buildDatabaseUrl(),
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? "vibestream",
    password: process.env.DB_PASSWORD ?? "vibestream",
    name: process.env.DB_NAME ?? "vibestream",
  },
  jwtSecret: process.env.JWT_SECRET ?? "vibestream-dev-secret",
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:8080,http://localhost:5173,http://127.0.0.1:5173").split(","),
  minio: {
    endpoint: process.env.MINIO_ENDPOINT ?? "localhost",
    port: Number(process.env.MINIO_PORT ?? 9000),
    url: buildMinioUrl(),
    accessKey: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
    bucketSongs: process.env.MINIO_BUCKET_SONGS ?? "songs",
    bucketCovers: process.env.MINIO_BUCKET_COVERS ?? "covers",
  },
  maxAudioBytes: 50 * 1024 * 1024,
  maxCoverBytes: 5 * 1024 * 1024,
};
