import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "default" | "primary" | "accent" | "success" | "danger" | "muted";

const TONE_CLASSES: Record<Tone, string> = {
  default: "bg-white/5 text-foreground border-border-strong",
  primary: "bg-primary/15 text-[#c4b0ff] border-primary/30",
  accent: "bg-accent/15 text-accent border-accent/30",
  success: "bg-success/15 text-success border-success/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  muted: "bg-white/[0.03] text-muted border-border",
};

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className
      )}
      {...props}
    />
  );
}
