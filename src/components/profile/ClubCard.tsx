"use client";

import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { GameIcon } from "@/components/GameIcon";
import { ClubRoleBadge } from "@/components/club/ClubRoleBadge";
import { Card, CardContent } from "@/components/ui/Card";
import { UI_ICONS } from "@/lib/fankit-ui";
import { useT } from "@/lib/i18n";
import type { PlayerClub } from "@/types/profile";

/** The player's club on their profile — links through to the club page with all members. */
export function ClubCard({ club }: { club: PlayerClub }) {
  const t = useT();

  return (
    <Link href={`/club/${club.tag}`} aria-label={t("club.view", { name: club.name })}>
      <Card interactive className="group">
        <CardContent className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center">
            <GameIcon
              src={club.badgeUrl ?? undefined}
              alt=""
              size={52}
              fallback={<Users className="h-7 w-7 text-primary" />}
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-2">{t("profile.club.title")}</p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-display text-lg font-bold">{club.name}</p>
              {club.role && <ClubRoleBadge role={club.role} />}
            </div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span>#{club.tag}</span>
              {club.trophies != null && (
                <span className="inline-flex items-center gap-1">
                  <GameIcon file={UI_ICONS.trophy} size={14} />
                  {club.trophies.toLocaleString()}
                </span>
              )}
              {club.memberCount != null && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {t("club.memberCount", { count: club.memberCount })}
                </span>
              )}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
        </CardContent>
      </Card>
    </Link>
  );
}
