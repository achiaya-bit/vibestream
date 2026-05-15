import { Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Cover({
  gradient,
  coverUrl,
  size = "md",
  className,
  animated = false,
}: {
  gradient: string;
  coverUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  animated?: boolean;
}) {
  const sizes = {
    xs: "h-10 w-10 rounded-md",
    sm: "h-14 w-14 rounded-lg",
    md: "h-40 w-40 rounded-2xl",
    lg: "h-56 w-56 rounded-2xl",
    xl: "h-72 w-72 rounded-3xl",
    full: "w-full aspect-square rounded-2xl",
  };

  return (
    <div className={cn("relative overflow-hidden shadow-elevated", sizes[size], className)}>
      {coverUrl ? (
        <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              gradient,
              animated && "animate-gradient-x",
            )}
          />
          <div
            className="absolute inset-0 mix-blend-overlay opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4), transparent 40%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.4), transparent 40%)",
            }}
          />
          <Music2
            className="absolute inset-0 m-auto text-white/30"
            size={size === "xs" || size === "sm" ? 18 : 48}
          />
        </>
      )}
    </div>
  );
}
