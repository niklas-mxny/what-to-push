"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { normalizePlayerTag } from "@/lib/tag";
import type { Favorite } from "@/types/profile";

interface FavoritesContextValue {
  favorites: Favorite[];
  isFavorite: (tag: string) => boolean;
  /** Saves or un-saves a player; resolves to whether it's now saved. */
  toggleFavorite: (player: Favorite) => Promise<boolean>;
  removeFavorite: (tag: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function byName(a: Favorite, b: Favorite) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const owner = user?.username ?? null;
  // Tagged with the account they belong to, so logging out (or switching
  // accounts) hides the old list immediately without a reset-in-effect.
  const [state, setState] = useState<{ owner: string | null; list: Favorite[] }>({ owner: null, list: [] });
  const favorites = useMemo(() => (owner && state.owner === owner ? state.list : []), [owner, state]);

  useEffect(() => {
    if (!owner) return;
    let cancelled = false;
    fetch("/api/favorites")
      .then((res) => (res.ok ? res.json() : { favorites: [] }))
      .then((data: { favorites: Favorite[] }) => {
        if (!cancelled) setState({ owner, list: data.favorites });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [owner]);

  const isFavorite = useCallback(
    (tag: string) => favorites.some((f) => f.tag === normalizePlayerTag(tag)),
    [favorites]
  );

  const removeFavorite = useCallback(
    async (rawTag: string) => {
      if (!owner) return;
      const tag = normalizePlayerTag(rawTag);
      setState((prev) => ({ owner, list: prev.list.filter((f) => f.tag !== tag) }));
      await fetch(`/api/favorites/${encodeURIComponent(tag)}`, { method: "DELETE" }).catch(() => {});
    },
    [owner]
  );

  const toggleFavorite = useCallback(
    async (player: Favorite): Promise<boolean> => {
      if (!owner) return false;
      const tag = normalizePlayerTag(player.tag);
      if (favorites.some((f) => f.tag === tag)) {
        await removeFavorite(tag);
        return false;
      }

      // Optimistic: the heart fills instantly, and rolls back if the save fails.
      setState((prev) => ({ owner, list: [...prev.list, { ...player, tag }].sort(byName) }));
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag }),
      }).catch(() => null);
      if (!res?.ok) {
        setState((prev) => ({ owner, list: prev.list.filter((f) => f.tag !== tag) }));
        return false;
      }
      const { favorite } = (await res.json()) as { favorite: Favorite };
      setState((prev) => ({ owner, list: prev.list.map((f) => (f.tag === tag ? favorite : f)).sort(byName) }));
      return true;
    },
    [owner, favorites, removeFavorite]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
