"use client";

import { Heart, X } from "lucide-react";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Dropdown, DropdownLink } from "@/components/ui/Dropdown";
import { useFavorites } from "@/lib/favorites-context";
import { useT } from "@/lib/i18n";

/** Nav bar menu listing the players the user saved with the heart button. */
export function FavoritesMenu() {
  const t = useT();
  const { favorites, removeFavorite } = useFavorites();

  return (
    <Dropdown
      label={t("favorites.title")}
      align="end"
      triggerClassName="nav-link-glow relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:bg-white/5 hover:text-heart aria-expanded:bg-heart/10 aria-expanded:text-heart"
      panelClassName="w-72 max-w-[calc(100vw-2rem)]"
      trigger={
        <>
          <Heart className={favorites.length > 0 ? "h-4 w-4 fill-heart text-heart" : "h-4 w-4"} strokeWidth={2.25} />
          {favorites.length > 0 && <span className="text-xs font-semibold text-foreground">{favorites.length}</span>}
        </>
      }
    >
      {(close) => (
        <>
          <p className="px-3 pb-1.5 pt-1 text-xs font-medium uppercase tracking-wide text-muted-2">
            {t("favorites.title")}
          </p>
          {favorites.length === 0 ? (
            <p className="px-3 pb-2 text-sm text-muted">{t("favorites.empty")}</p>
          ) : (
            <div className="scrollbar-thin flex max-h-80 flex-col overflow-y-auto">
              {favorites.map((f) => (
                <div key={f.tag} className="group/row flex items-center gap-1">
                  <DropdownLink href={`/player/${f.tag}`} onNavigate={close} className="min-w-0 flex-1">
                    <PlayerAvatar src={f.iconUrl} name={f.name} size={30} className="ring-1 ring-border-strong" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-foreground">{f.name}</span>
                      <span className="block truncate text-xs text-muted-2">#{f.tag}</span>
                    </span>
                  </DropdownLink>
                  <button
                    type="button"
                    data-dropdown-item
                    onClick={() => removeFavorite(f.tag)}
                    aria-label={`${t("favorites.remove")}: ${f.name}`}
                    title={t("favorites.remove")}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-2 opacity-60 outline-none transition hover:bg-heart/15 hover:text-heart hover:opacity-100 focus-visible:bg-heart/15 focus-visible:text-heart focus-visible:opacity-100 group-hover/row:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Dropdown>
  );
}
