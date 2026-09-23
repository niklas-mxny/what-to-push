"use client";

import Image from "next/image";
import { Shield } from "lucide-react";
import { fameArt } from "@/lib/fankit-ui";

const ROMAN = ["", "I", "II", "III"];

/**
 * Official fame tier art. Only Earth has art for every division; for the other
 * planets the fan kit's art always shows one star, so from division II on that
 * star is covered by a badge with the actual division instead of showing a
 * misleading "I".
 */
export function FameIcon({ tierName, size }: { tierName: string; size: number }) {
  const art = fameArt(tierName);
  if (!art) return <Shield className="text-accent" style={{ width: size / 2, height: size / 2 }} />;

  // A box with the art's own proportions, fitted into size×size, so the
  // badge can be positioned in the art's coordinates.
  const width = art.aspect >= 1 ? size : size * art.aspect;
  const height = art.aspect >= 1 ? size / art.aspect : size;
  const star = art.coverStar;

  return (
    <span className="flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <span className="relative block" style={{ width, height }}>
        <Image
          src={art.url}
          alt={tierName}
          width={Math.round(width)}
          height={Math.round(height)}
          unoptimized
          style={{ width, height }}
          className="object-contain"
        />
        {star && art.division && (
          <span
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-accent bg-background-elevated font-display font-bold leading-none text-accent shadow-[0_0_10px_-2px_var(--accent)]"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              // A bit larger than the star so none of it peeks out.
              minWidth: (width * star.w * 1.15) / 100,
              height: (width * star.w) / 100,
              fontSize: (width * star.w) / 100 / 1.9,
              paddingInline: 4,
            }}
          >
            {ROMAN[art.division]}
          </span>
        )}
      </span>
    </span>
  );
}
