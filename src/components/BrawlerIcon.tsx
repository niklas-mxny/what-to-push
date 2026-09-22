import Image from "next/image";
import { cn } from "@/lib/cn";
import type { MergedBrawler } from "@/types/domain";

export function BrawlerIcon({
  brawler,
  size = 48,
  className,
}: {
  brawler: Pick<MergedBrawler, "name" | "iconUrl" | "owned">;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background-elevated ring-1 ring-border-strong",
        !brawler.owned && "grayscale opacity-60",
        className
      )}
      style={{ width: size, height: size }}
    >
      {brawler.iconUrl ? (
        <Image
          src={brawler.iconUrl}
          alt={brawler.name}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <span className="font-display text-sm font-bold text-muted">
          {brawler.name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}
