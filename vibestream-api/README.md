# VibeStream API

Node.js + Express backend with **PostgreSQL**, JWT auth, and local file uploads for audio/covers.

## Prerequisites

- Node.js 20+
- Docker (recommended for PostgreSQL) or a local PostgreSQL 16 instance

## Quick start (Docker PostgreSQL)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start PostgreSQL
docker compose up -d postgres

# 3. Install dependencies
npm install

# 4. Run migrations + seed data
npm run db:setup

# 5. Start API
npm run dev
```

API: http://localhost:3001  
Health: http://localhost:3001/health

### Demo accounts (after seed)

| Email | Password | Role |
|-------|----------|------|
| admin@vibestream.dev | admin123 | admin |
| demo@vibestream.dev | demo1234 | user |

## Environment variables

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
| `UPLOAD_DIR` | Root folder for uploads | `./uploads` |

If `DATABASE_URL` is set, it takes precedence over `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.

## Database commands

```bash
npm run db:migrate   # Apply Drizzle migrations
npm run db:seed      # Seed catalog (skips if data exists)
npm run db:setup     # migrate + seed
npm run db:generate  # Generate new migration from schema changes (drizzle-kit)
```

## Uploads

Files are stored on disk (not in the database):

```
uploads/
  audio/    # MP3 tracks
  covers/   # JPEG, PNG, WebP
```

Served at `/uploads/...` — paths are stored in PostgreSQL (`audio_path`, `cover_image_path`).

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

## Docker (full stack, future)

`docker-compose.yml` includes PostgreSQL with a healthcheck. An `api` service stub and `Dockerfile` are ready — uncomment the `api` block in `docker-compose.yml` when you want to run the API in a container:

```bash
docker compose up -d
```

## Migrating from SQLite

SQLite is no longer supported. To move to PostgreSQL:

1. Start PostgreSQL (`docker compose up -d postgres`)
2. Update `.env` with PostgreSQL credentials
3. Run `npm run db:setup`
4. Re-upload tracks via the admin dashboard (files in `uploads/` remain on disk; re-link by uploading again or manual DB insert)

## Frontend

Run `vibestream-ui` with Vite — it proxies `/api` and `/uploads` to port `3001`.
