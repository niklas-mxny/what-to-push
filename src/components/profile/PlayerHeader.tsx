import type { ReactNode } from "react";
import Link from "next/link";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import type { PublicPlayer } from "@/types/profile";

export function PlayerHeader({
  name,
  iconUrl,
  children,
  actions,
}: {
  name: string;
  iconUrl: string;
  /** Sub-lines under the name (username, club, tag…). */
  children?: ReactNode;
  /** Right-aligned controls, e.g. the favorite heart. */
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      <PlayerAvatar src={iconUrl} name={name} size={88} className="glow-ring-accent ring-2 ring-accent/60" />
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">{name}</h1>
        {children}
      </div>
      {actions}
    </div>
  );
}

/** "Club Name · #TAG" under a player's name, with the club linking to its page. */
export function PlayerSubline({ player }: { player: PublicPlayer }) {
  return (
    <p className="text-xs text-muted-2">
      {player.club && (
        <>
          <Link href={`/club/${player.club.tag}`} className="font-medium text-muted transition-colors hover:text-primary">
            {player.club.name}
          </Link>
          {" · "}
        </>
      )}
      #{player.tag}
    </p>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="h-22 w-22 animate-pulse rounded-full bg-card/60" />
        <div className="h-12 w-full max-w-xs animate-pulse rounded-card bg-card/50" />
      </div>
      <div className="h-28 animate-pulse rounded-card border border-border bg-card/50" />
      <div className="h-36 animate-pulse rounded-card border border-border bg-card/50" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-card border border-border bg-card/50" />
        ))}
      </div>
    </div>
  );
}
