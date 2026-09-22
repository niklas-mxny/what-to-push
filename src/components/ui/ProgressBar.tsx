import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  max,
  className,
  toneClassName = "bg-primary",
  glowColor,
}: {
  value: number;
  max: number;
  className?: string;
  toneClassName?: string;
  /** CSS color for the neon glow; defaults to the primary color. Match it to `toneClassName`. */
  glowColor?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={cn("h-2 w-full rounded-full bg-white/5", className)}>
      <div
        className={cn("glow-bar h-full rounded-full transition-all duration-500 ease-out", toneClassName)}
        style={{ width: `${pct}%`, ...(glowColor && { "--bar-glow": glowColor }) } as CSSProperties}
      />
    </div>
  );
}
