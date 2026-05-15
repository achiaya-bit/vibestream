export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-24 text-muted-foreground">
      <div className="h-8 w-8 rounded-full border-2 border-[var(--neon-cyan)] border-t-transparent animate-spin" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}
