import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ImageIcon, Loader2, Music2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { usePlayer } from "@/context/player-context";
import { queryKeys } from "@/hooks/queries";
import type { Artist, Song } from "@/lib/types";
import { genres } from "@/lib/types";
import { adminApi } from "@/services/api";
import { cn } from "@/lib/utils";

const MAX_AUDIO = 50 * 1024 * 1024;
const MAX_COVER = 5 * 1024 * 1024;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artists: Artist[];
};

function DropZone({
  label,
  hint,
  accept,
  file,
  previewUrl,
  onFile,
  onClear,
  icon: Icon,
}: {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  previewUrl: string | null;
  onFile: (f: File) => void;
  onClear: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const f = files?.[0];
      if (f) onFile(f);
    },
    [onFile],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "relative rounded-2xl border-2 border-dashed p-5 text-center transition cursor-pointer",
        dragOver ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10" : "border-white/15 hover:border-white/30 hover:bg-white/5",
        file && "border-[var(--neon-purple)]/50 bg-white/5",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {file && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 grid place-items-center text-white hover:bg-black/70"
          aria-label="Remove file"
        >
          <X size={14} />
        </button>
      )}
      {previewUrl ? (
        <div className="mx-auto mb-3 h-28 w-28 rounded-xl overflow-hidden shadow-glow">
          {accept.includes("image") ? (
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-hero grid place-items-center">
              <Music2 className="text-white" />
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-gradient-hero shadow-glow grid place-items-center">
          <Icon size={22} className="text-white" />
        </div>
      )}
      <p className="font-semibold text-sm">{file ? file.name : label}</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}

export function UploadMusicDialog({ open, onOpenChange, artists }: Props) {
  const queryClient = useQueryClient();
  const { play } = usePlayer();

  const [title, setTitle] = useState("");
  const [artistId, setArtistId] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState(genres[1] ?? "Electronic");
  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const reset = useCallback(() => {
    setTitle("");
    setArtistId("");
    setAlbum("");
    setGenre(genres[1] ?? "Electronic");
    setAudio(null);
    setCover(null);
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setAudioPreview(null);
    setCoverPreview(null);
    setProgress(0);
    setStatus("idle");
    setError("");
  }, [audioPreview, coverPreview]);

  const setAudioFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".mp3") && f.type !== "audio/mpeg") {
      setError("Audio must be an MP3 file.");
      return;
    }
    if (f.size > MAX_AUDIO) {
      setError("Audio file must be 50 MB or smaller.");
      return;
    }
    setError("");
    setAudio(f);
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioPreview(URL.createObjectURL(f));
  };

  const setCoverFile = (f: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Cover must be JPEG, PNG, or WebP.");
      return;
    }
    if (f.size > MAX_COVER) {
      setError("Cover image must be 5 MB or smaller.");
      return;
    }
    setError("");
    setCover(f);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audio || !cover) {
      setError("MP3 and cover image are required.");
      return;
    }
    if (!title.trim() || !artistId || !album.trim() || !genre) {
      setError("Please fill in all metadata fields.");
      return;
    }

    setStatus("uploading");
    setProgress(0);
    setError("");

    const form = new FormData();
    form.append("audio", audio);
    form.append("cover", cover);
    form.append("title", title.trim());
    form.append("artistId", artistId);
    form.append("album", album.trim());
    form.append("genre", genre);

    try {
      const { data } = await adminApi.upload(form, setProgress);
      const song = data as Song;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["songs"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.adminStats }),
        queryClient.invalidateQueries({ queryKey: queryKeys.playlists }),
      ]);

      setStatus("success");
      setProgress(100);
      play(song);

      setTimeout(() => {
        reset();
        onOpenChange(false);
      }, 1400);
    } catch (err: unknown) {
      setStatus("error");
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : null;
      setError(msg ?? "Upload failed. Check that you are signed in as admin.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && status !== "uploading") reset();
        if (status !== "uploading") onOpenChange(v);
      }}
    >
      <DialogContent className="glass-strong border-white/10 sm:max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Upload music</DialogTitle>
          <DialogDescription>Add a new track to the VibeStream catalog.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <DropZone
              label="Drop MP3 here"
              hint="Max 50 MB · MP3 only"
              accept="audio/mpeg,.mp3"
              file={audio}
              previewUrl={audioPreview}
              onFile={setAudioFile}
              onClear={() => {
                setAudio(null);
                if (audioPreview) URL.revokeObjectURL(audioPreview);
                setAudioPreview(null);
              }}
              icon={Music2}
            />
            <DropZone
              label="Drop cover image"
              hint="Max 5 MB · JPG, PNG, WebP"
              accept="image/jpeg,image/png,image/webp"
              file={cover}
              previewUrl={coverPreview}
              onFile={setCoverFile}
              onClear={() => {
                setCover(null);
                if (coverPreview) URL.revokeObjectURL(coverPreview);
                setCoverPreview(null);
              }}
              icon={ImageIcon}
            />
          </div>

          <div className="grid gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--neon-cyan)] focus:outline-none text-sm"
              disabled={status === "uploading"}
            />
            <select
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--neon-cyan)] focus:outline-none text-sm"
              disabled={status === "uploading"}
            >
              <option value="">Select artist</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <input
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="Album"
              className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--neon-cyan)] focus:outline-none text-sm"
              disabled={status === "uploading"}
            />
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--neon-cyan)] focus:outline-none text-sm"
              disabled={status === "uploading"}
            >
              {genres.filter((g) => g !== "All").map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {status === "uploading" && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 text-sm text-[var(--neon-cyan)] rounded-xl bg-[var(--neon-cyan)]/10 px-4 py-3">
              <CheckCircle2 size={18} />
              Track uploaded — now playing
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 rounded-xl bg-red-500/10 px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={status === "uploading" || status === "success"}
            className="w-full h-12 rounded-xl bg-gradient-hero shadow-glow font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {status === "uploading" ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload track
              </>
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
