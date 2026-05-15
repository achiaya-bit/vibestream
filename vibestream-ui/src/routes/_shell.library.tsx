import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PlaylistCard } from "@/components/playlist-card";
import { PageLoader } from "@/components/page-loader";
import { playlistsQuery } from "@/hooks/queries";

export const Route = createFileRoute("/_shell/library")({
  head: () => ({ meta: [{ title: "Library — VibeStream" }] }),
  component: Library,
});

function Library() {
  const { data: playlists = [], isLoading, isError } = useQuery(playlistsQuery);

  if (isLoading) return <PageLoader label="Loading library…" />;
  if (isError) return <p className="text-center py-20 text-muted-foreground">Unable to load playlists.</p>;

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-display font-bold mb-6">Your library</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {playlists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}
      </div>
    </div>
  );
}
