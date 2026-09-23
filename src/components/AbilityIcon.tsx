"use client";

import type { CSSProperties } from "react";
import { Sparkles, Zap } from "lucide-react";
import { GameIcon } from "@/components/GameIcon";
import { cn } from "@/lib/cn";
import { ABILITY_FRAMES } from "@/lib/fankit-ui";

export type AbilityKind = "gadget" | "starPower" | "hypercharge";

/** Where the symbol sits inside each official empty frame (percent of the icon box). */
const SYMBOL_BOX: Record<keyof typeof ABILITY_FRAMES, CSSProperties> = {
  gadget: { left: "23%", top: "21%", width: "54%", height: "54%" },
  starPower: { left: "26%", top: "24%", width: "48%", height: "48%" },
};

/**
 * A gadget / star power / hypercharge icon in the game's badge style. Framed art
 * is shown as-is. Bare gadget/star power symbols (some fan kit assets, all
 * BrawlAPI fallbacks) are placed inside the fan kit's official empty frame —
 * green for gadgets, the gold jagged star for star powers — so every icon of a
 * kind looks the same. Hypercharges are always the official flame badge.
 */
export function AbilityIcon({
  kind,
  src,
  framed,
  size,
  alt = "",
  title,
  className,
}: {
  kind: AbilityKind;
  src?: string;
  framed?: boolean;
  size: number;
  alt?: string;
  title?: string;
  className?: string;
}) {
  if (kind === "hypercharge") {
    return (
      <span className={cn("inline-block shrink-0", className)} title={title} style={{ width: size, height: size }}>
        <GameIcon
          src={src}
          alt={alt}
          size={size}
          fallback={<Zap className="h-full w-full p-[15%] text-primary" strokeWidth={2.5} />}
        />
      </span>
    );
  }

  const inFrame = (
    <span
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: size }}
      title={title}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
    >
      <GameIcon file={ABILITY_FRAMES[kind]} size={size} className="absolute inset-0" />
      <span className="absolute flex items-center justify-center" style={SYMBOL_BOX[kind]}>
        <GameIcon
          src={src}
          size={Math.round(size * 0.54)}
          className="h-full w-full"
          fallback={<Sparkles className="h-full w-full text-white" strokeWidth={2.5} />}
        />
      </span>
    </span>
  );

  if (!framed || !src) return inFrame;
  return (
    <span className={cn("inline-block shrink-0", className)} title={title} style={{ width: size, height: size }}>
      <GameIcon src={src} alt={alt} size={size} fallback={inFrame} />
    </span>
  );
}
