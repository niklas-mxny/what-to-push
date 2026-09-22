import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  max,
  className,
  toneClassName = "bg-primary",
}: {
  value: number;
  max: number;
  className?: string;
  toneClassName?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/5", className)}>
      <div
        className={cn("h-full rounded-full transition-all", toneClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
