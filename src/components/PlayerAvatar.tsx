"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

/** Player profile icon with an initials fallback if the CDN image fails. */
export function PlayerAvatar({
  src,
  name,
  size,
  className,
}: {
  src: string;
  name: string;
  size: number;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = !src || failedSrc === src;

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-elevated",
        className
      )}
      style={{ width: size, height: size }}
    >
      {!failed ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          unoptimized
          onError={() => setFailedSrc(src)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-display font-bold text-muted" style={{ fontSize: Math.max(10, size * 0.32) }}>
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}
