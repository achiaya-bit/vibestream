# VibeStream API

Node.js + Express backend with **PostgreSQL**, **MinIO** object storage, JWT auth, and admin uploads for audio/covers.

## Prerequisites

- Node.js 20+
- Docker (recommended for PostgreSQL + MinIO) or local instances

## Quick start (Docker Compose)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start PostgreSQL and MinIO
docker compose up -d postgres minio

# 3. Install dependencies
npm install

# 4. Run migrations + seed data
npm run db:setup

# 5. Start API
npm run dev
```

API: http://localhost:3001  
Health: http://localhost:3001/health  
MinIO Console: http://localhost:9001 (login with `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY`)

### Demo accounts (after seed)

| Email | Password | Role |
|-------|----------|------|
| admin@vibestream.dev | admin123 | admin |
| demo@vibestream.dev | demo1234 | user |

## MinIO setup

VibeStream stores uploaded MP3 files and cover images in **MinIO** (S3-compatible). Buckets are created automatically on API startup if they do not exist.

| Bucket (env var) | Default name | Content |
|------------------|--------------|---------|
| `MINIO_BUCKET_SONGS` | `songs` | MP3 audio |
| `MINIO_BUCKET_COVERS` | `covers` | JPEG, PNG, WebP |

### Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MINIO_ENDPOINT` | MinIO hostname (`localhost` on host, `minio` in Docker network) | `localhost` |
| `MINIO_PORT` | S3 API port | `9000` |
| `MINIO_ACCESS_KEY` | Access key (same as `MINIO_ROOT_USER` in Docker) | `minioadmin` |
| `MINIO_SECRET_KEY` | Secret key (same as `MINIO_ROOT_PASSWORD` in Docker) | `minioadmin` |
| `MINIO_BUCKET_SONGS` | Audio bucket name | `songs` |
| `MINIO_BUCKET_COVERS` | Cover images bucket name | `covers` |
| `MINIO_USE_SSL` | Use HTTPS for MinIO (`true` / `false`) | `false` |

### Local development (API on host, MinIO in Docker)

```bash
docker compose up -d minio
```

Use in `.env`:

```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### API in Docker (future)

When running the API container on the same Compose network, set:

```env
MINIO_ENDPOINT=minio
MINIO_PORT=9000
```

### PostgreSQL variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Full PostgreSQL connection string | Built from `DB_*` if unset |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL user | `vibestream` |
| `DB_PASSWORD` | PostgreSQL password | `vibestream` |
| `DB_NAME` | Database name | `vibestream` |
| `PORT` | API port | `3001` |
| `JWT_SECRET` | JWT signing secret | — |
| `CORS_ORIGIN` | Comma-separated allowed origins | local dev URLs |

## Database commands

```bash
npm run db:migrate   # Apply Drizzle migrations
npm run db:seed      # Seed catalog (skips if data exists)
npm run db:setup     # migrate + seed
npm run db:generate  # Generate new migration from schema changes (drizzle-kit)
```

## Uploads & playback

1. Admin uploads MP3 + cover via `POST /api/admin/upload`.
2. Files are stored in MinIO; **object keys** are saved in PostgreSQL (`audio_path`, `cover_image_path`).
3. Audio streams through `GET /api/songs/:id/stream` (proxied from MinIO, supports range requests).
4. Covers are served at `/uploads/covers/{key}` (proxied from MinIO).

The frontend Vite dev server proxies `/api` and `/uploads` to port `3001` — no frontend changes required.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/songs` | List songs |
| GET | `/api/songs/:id/stream` | Stream audio |
| GET | `/api/playlists` | List playlists |
| GET | `/api/artists` | List artists |
| POST | `/api/admin/upload` | Upload track (admin) |
| GET | `/api/admin/stats` | Admin stats |
| GET | `/uploads/covers/:key` | Cover image |
| GET | `/uploads/songs/:key` | Audio file (optional direct URL) |

## Docker services

```bash
docker compose up -d postgres minio
```

- **postgres** — PostgreSQL 16 with healthcheck  
- **minio** — MinIO S3 API on port 9000, web console on 9001  

An `api` service stub is ready in `docker-compose.yml` — uncomment when you add a `Dockerfile`.

## Migrating from local disk uploads

If you previously stored files under `./uploads/`, re-upload tracks via the admin dashboard so they are stored in MinIO. Object keys in the database must match keys in the buckets.

## Frontend

Run `vibestream-ui` with Vite — it proxies `/api` and `/uploads` to port `3001`.
