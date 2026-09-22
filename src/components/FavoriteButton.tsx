"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/cn";
import { useFavorites } from "@/lib/favorites-context";
import { useT } from "@/lib/i18n";
import type { Favorite } from "@/types/profile";

const baseClassName =
  "btn-glow flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-50";
const idleClassName = "border-border-strong bg-white/5 text-muted hover:border-heart/50 hover:text-heart";

/** Heart toggle that saves a player to the signed-in user's list. Logged out, it leads to the login page. */
export function FavoriteButton({ player, className }: { player: Favorite; className?: string }) {
  const t = useT();
  const { user, loading } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(player.tag);

  if (!loading && !user) {
    return (
      <Link
        href="/login"
        title={t("favorites.loginRequired")}
        aria-label={t("favorites.loginRequired")}
        className={cn(baseClassName, idleClassName, className)}
      >
        <Heart className="h-4.5 w-4.5" strokeWidth={2.25} />
      </Link>
    );
  }

  const label = saved ? t("favorites.remove") : t("favorites.save");
  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => toggleFavorite(player)}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={cn(baseClassName, saved ? "border-heart/50 bg-heart/15 text-heart" : idleClassName, className)}
    >
      {/* Keyed so the pop animation replays on every save. */}
      <Heart
        key={saved ? "saved" : "idle"}
        className={cn("h-4.5 w-4.5", saved && "heart-pop heart-glow fill-heart")}
        strokeWidth={2.25}
      />
    </button>
  );
}
