import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { parseDuration } from "@/lib/format";
import type { Song } from "@/lib/types";
import { songsQuery } from "@/hooks/queries";
import { songsApi } from "@/services/api";

type PlayerCtx = {
  current: Song | null;
  queue: Song[];
  isPlaying: boolean;
  progress: number;
  volume: number;
  liked: Set<string>;
  isLoading: boolean;
  play: (song: Song, queue?: Song[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (p: number) => void;
  setVolume: (v: number) => void;
  toggleLike: (id: string) => void;
};

const Ctx = createContext<PlayerCtx | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { data: catalog = [], isLoading } = useQuery(songsQuery());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [liked, setLiked] = useState<Set<string>>(new Set(["s3", "s8"]));

  const current = queue[index] ?? null;

  useEffect(() => {
    if (catalog.length && queue.length === 0) setQueue(catalog);
  }, [catalog, queue.length]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setProgress(audio.currentTime / audio.duration);
      }
    };
    const onEnded = () => {
      setIndex((i) => (queue.length ? (i + 1) % queue.length : 0));
      setProgress(0);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [queue.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;

    audio.src = songsApi.stream(current.id);
    audio.volume = volume;
    audio.load();

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [current?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    if (isPlaying && current) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying, volume, current?.id]);

  const play = useCallback(
    (song: Song, q?: Song[]) => {
      const newQ = q ?? (queue.length ? queue : catalog);
      const i = newQ.findIndex((s) => s.id === song.id);
      if (q) setQueue(newQ);
      else if (!queue.length && catalog.length) setQueue(catalog);
      setIndex(i >= 0 ? i : 0);
      setProgress(0);
      setIsPlaying(true);
    },
    [queue, catalog],
  );

  const seek = useCallback(
    (p: number) => {
      const audio = audioRef.current;
      const clamped = Math.max(0, Math.min(1, p));
      setProgress(clamped);
      if (audio?.duration && Number.isFinite(audio.duration)) {
        audio.currentTime = clamped * audio.duration;
      } else if (current) {
        audioRef.current!.currentTime = clamped * parseDuration(current.duration);
      }
    },
    [current],
  );

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const value = useMemo<PlayerCtx>(
    () => ({
      current,
      queue: queue.length ? queue : catalog,
      isPlaying,
      progress,
      volume,
      liked,
      isLoading,
      play,
      toggle: () => setIsPlaying((p) => !p),
      next: () => {
        setIndex((i) => (queue.length ? (i + 1) % queue.length : 0));
        setProgress(0);
      },
      prev: () => {
        setIndex((i) => (queue.length ? (i - 1 + queue.length) % queue.length : 0));
        setProgress(0);
      },
      seek,
      setVolume,
      toggleLike: (id) =>
        setLiked((s) => {
          const n = new Set(s);
          if (n.has(id)) n.delete(id);
          else n.add(id);
          return n;
        }),
    }),
    [current, queue, catalog, isPlaying, progress, volume, liked, isLoading, play, seek, setVolume],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const usePlayer = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlayer must be inside PlayerProvider");
  return c;
};
