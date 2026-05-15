import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { ensureUploadDirs } from "./utils/uploads.js";
import { errorHandler } from "./middleware/error.js";
import adminRouter from "./routes/admin.js";
import artistsRouter from "./routes/artists.js";
import authRouter from "./routes/auth.js";
import playlistsRouter from "./routes/playlists.js";
import songsRouter from "./routes/songs.js";

export function createApp() {
  ensureUploadDirs();
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use("/uploads", express.static(config.uploadDir));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  const api = express.Router();
  api.use("/auth", authRouter);
  api.use("/songs", songsRouter);
  api.use("/playlists", playlistsRouter);
  api.use("/artists", artistsRouter);
  api.use("/admin", adminRouter);

  app.use("/api", api);
  app.use(errorHandler);

  return app;
}
