"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { fanKitImage } from "@/lib/fankit-ui";

/**
 * A fan kit game icon by file (see src/lib/fankit-ui.ts), or a full URL.
 * Renders `fallback` instead if the image is missing or fails to load.
 */
export function GameIcon({
  file,
  src,
  alt = "",
  size,
  className,
  fallback = null,
}: {
  file?: string;
  src?: string;
  alt?: string;
  size: number;
  className?: string;
  fallback?: ReactNode;
}) {
  // Request ~2x the display size for sharp icons on high-DPI screens, bucketed so
  // the CDN can reuse cached renditions across sizes.
  const url = src ?? (file ? fanKitImage(file, size * 2 <= 64 ? 64 : size * 2 <= 128 ? 128 : 256) : undefined);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!url || failedUrl === url) return <>{fallback}</>;
  return (
    <Image
      src={url}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      onError={() => setFailedUrl(url)}
      style={{ width: size, height: size }}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
