import axios from "axios";

// Pre-wired axios instance for future Node.js + PostgreSQL backend.
// Endpoints: /api/auth, /api/songs, /api/playlists, /api/artists, /api/admin
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("vibestream_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("vibestream_token");
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

export const songsApi = {
  list: (params?: Record<string, string>) => api.get("/songs", { params }),
  get: (id: string) => api.get(`/songs/${id}`),
  stream: (id: string) => `${api.defaults.baseURL}/songs/${id}/stream`,
};

export const playlistsApi = {
  list: () => api.get("/playlists"),
  get: (id: string) => api.get(`/playlists/${id}`),
  create: (data: { title: string; description?: string }) => api.post("/playlists", data),
};

export const artistsApi = {
  list: () => api.get("/artists"),
  get: (id: string) => api.get(`/artists/${id}`),
};

export const adminApi = {
  upload: (form: FormData, onProgress?: (percent: number) => void) =>
    api.post("/admin/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120_000,
      onUploadProgress: (event) => {
        if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100));
      },
    }),
  stats: () => api.get("/admin/stats"),
  users: () => api.get("/admin/users"),
};
