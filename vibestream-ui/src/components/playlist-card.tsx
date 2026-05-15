import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Cover } from "@/components/cover";
import type { Playlist } from "@/lib/types";

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Link
        to="/playlist/$id"
        params={{ id: playlist.id }}
        className="group block glass rounded-2xl p-4 relative"
      >
        <div className="relative">
          <Cover gradient={playlist.cover} size="full" />
          <div className="absolute bottom-3 right-3 h-12 w-12 rounded-full bg-gradient-hero shadow-glow grid place-items-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
            <Play size={20} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
        <h3 className="mt-4 font-semibold truncate">{playlist.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{playlist.description}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {playlist.songCount} tracks · {playlist.curator}
        </p>
      </Link>
    </motion.div>
  );
}
