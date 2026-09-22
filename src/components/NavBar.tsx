"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, LogOut, Search, Settings, Swords, Trophy, User } from "lucide-react";
import { FavoritesMenu } from "@/components/FavoritesMenu";
import { GameIcon } from "@/components/GameIcon";
import { LanguageSelector } from "@/components/LanguageSelector";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";
import { UI_ICONS } from "@/lib/fankit-ui";
import { useT } from "@/lib/i18n";

export function NavBar() {
  const pathname = usePathname();
  const t = useT();
  const { user, loading, logout } = useAuth();

  const links = [
    { href: "/", label: t("nav.dashboard"), icon: LayoutGrid },
    { href: "/brawlers", label: t("nav.brawlers"), icon: Swords },
    { href: "/search", label: t("nav.search"), icon: Search },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6">
            <GameIcon
              file={UI_ICONS.trophy}
              size={34}
              className="logo-glow-img"
              fallback={<Trophy className="h-6 w-6 text-accent" strokeWidth={2.5} />}
            />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            What to <span className="text-accent">Push</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <nav className="flex items-center gap-1 rounded-full border border-border bg-card/60 p-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "nav-link-glow flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
                    active
                      ? "nav-link-active-glow bg-primary text-primary-foreground"
                      : "text-muted hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.25} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          {!loading && (
            <div className="flex items-center gap-1 rounded-full border border-border bg-card/60 p-1">
              {user ? (
                <>
                  <FavoritesMenu />
                  <Link
                    href={`/profile/${user.username}`}
                    className="nav-link-glow flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:bg-white/5 hover:text-foreground"
                  >
                    <User className="h-4 w-4" strokeWidth={2.25} />
                    <span className="hidden sm:inline">{user.username}</span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="nav-link-glow flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:bg-white/5 hover:text-foreground"
                    title={t("nav.logout")}
                  >
                    <LogOut className="h-4 w-4" strokeWidth={2.25} />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="nav-link-glow rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:bg-white/5 hover:text-foreground"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-glow rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {t("nav.signup")}
                  </Link>
                </>
              )}
            </div>
          )}

          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
