"use client";

import { useState } from "react";
import Image from "next/image";
import { Medal, Shield, Sparkles, Swords, Trophy, UserRound, Users } from "lucide-react";
import { GoalComparison } from "@/components/profile/GoalComparison";
import { Card, CardContent } from "@/components/ui/Card";
import { useT } from "@/lib/i18n";
import type { PublicPlayer, RankInfo } from "@/types/profile";

function StatTile({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string | number }) {
  return (
    <Card interactive className="group">
      <CardContent className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors duration-200 group-hover:bg-primary/25">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{value}</p>
          <p className="truncate text-xs text-muted">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RankCard({ label, rank }: { label: string; rank: RankInfo }) {
  const t = useT();
  const [iconFailed, setIconFailed] = useState(false);
  return (
    <Card interactive>
      <CardContent className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-background-elevated ring-1 ring-border-strong">
          {!iconFailed ? (
            <Image
              src={rank.iconUrl}
              alt={rank.rankName}
              width={48}
              height={48}
              unoptimized
              onError={() => setIconFailed(true)}
              className="object-contain"
            />
          ) : (
            <Medal className="h-6 w-6 text-accent" />
          )}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-2">{label}</p>
          <p className="truncate font-display text-base font-bold">{rank.rankName}</p>
          {rank.elo != null && <p className="text-xs text-muted">{t("profile.ranked.elo", { elo: rank.elo })}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

/** The full stats block every profile shows — account profiles and tag-only profiles alike. */
export function PlayerStats({ player: p }: { player: PublicPlayer }) {
  const t = useT();

  return (
    <>
      <div className="glow-ring-accent relative overflow-hidden rounded-card border border-accent/40 bg-gradient-to-br from-accent/20 via-card to-card p-6">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-accent" />
            <div>
              <p className="font-display text-3xl font-bold">{p.trophies.toLocaleString()}</p>
              <p className="text-xs text-muted">{t("profile.stats.trophies")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <p className="font-display text-3xl font-bold">{p.totalPrestigeLevel}</p>
              <p className="text-xs text-muted">{t("profile.stats.prestigeTotal")}</p>
            </div>
          </div>
        </div>
      </div>

      <GoalComparison player={p} />

      {(p.rankedCurrent || p.rankedHighest) && (
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-2">
            {t("profile.ranked.title")}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {p.rankedCurrent && <RankCard label={t("profile.ranked.current")} rank={p.rankedCurrent} />}
            {p.rankedHighest && <RankCard label={t("profile.ranked.highest")} rank={p.rankedHighest} />}
          </div>
        </div>
      )}

      {p.fame && (
        <Card interactive>
          <CardContent className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Shield className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-lg font-bold">
                {p.fame.value.toLocaleString()} <span className="text-sm font-normal text-muted">— {p.fame.tierName}</span>
              </p>
              <p className="text-xs text-muted">{t("profile.fame.title")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Swords} label={t("profile.stats.victories3v3")} value={p.victories3v3.toLocaleString()} />
        <StatTile icon={UserRound} label={t("profile.stats.soloShowdownWins")} value={p.soloVictories.toLocaleString()} />
        <StatTile icon={Users} label={t("profile.stats.duoShowdownWins")} value={p.duoVictories.toLocaleString()} />
        <StatTile icon={Medal} label={t("profile.stats.brawlersOwned")} value={p.brawlersOwned} />
      </div>
    </>
  );
}
