"use client";

import { Sparkles } from "lucide-react";
import { BrawlerIcon } from "@/components/BrawlerIcon";
import { BuildIcons } from "@/components/BuildIcons";
import { GameIcon } from "@/components/GameIcon";
import { RoleBadge } from "@/components/RoleBadge";
import { Badge } from "@/components/ui/Badge";
import { MODE_ICONS } from "@/lib/fankit-ui";
import { formatReasons, useT } from "@/lib/i18n";
import type { SlotRecommendation } from "@/types/domain";

export function BestPickHero({
  recommendations,
  onOpen,
}: {
  recommendations: SlotRecommendation[];
  onOpen: (rec: SlotRecommendation, brawlerKey: string) => void;
}) {
  const t = useT();
  let best: { rec: SlotRecommendation } | null = null;
  for (const rec of recommendations) {
    if (rec.picks[0] && (!best || rec.picks[0].score > best.rec.picks[0].score)) {
      best = { rec };
    }
  }

  if (!best) return null;
  const pick = best.rec.picks[0];

  return (
    <div className="glow-ring-accent relative overflow-hidden rounded-card border border-primary/40 bg-gradient-to-br from-primary/25 via-card to-card p-6 transition-colors hover:border-primary/70">
      <div className="absolute -right-10 -top-10 h-40 w-40 animate-pulse rounded-full bg-accent/20 blur-3xl" />
      <button
        type="button"
        onClick={() => onOpen(best.rec, pick.brawler.key)}
        aria-label={t("slot.open", { mode: best.rec.slot.modeLabel, map: best.rec.slot.mapName })}
        className="absolute inset-0 z-10 rounded-card outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <BrawlerIcon
            brawler={pick.brawler}
            size={72}
            className="ring-2 ring-accent transition-transform duration-300 hover:scale-105"
          />
          <div>
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
              <Sparkles className="h-3.5 w-3.5" /> {t("dashboard.bestPick")}
            </span>
            <p className="font-display text-2xl font-bold">{pick.brawler.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <RoleBadge role={pick.brawler.role} />
              <Badge>
                {MODE_ICONS[best.rec.slot.modeKey] && <GameIcon file={MODE_ICONS[best.rec.slot.modeKey]} size={16} />}
                {best.rec.slot.modeLabel} · {best.rec.slot.mapName}
              </Badge>
            </div>
            <div className="mt-2">
              <BuildIcons brawler={pick.brawler} />
            </div>
          </div>
        </div>
        <p className="max-w-xs text-sm text-muted sm:text-right">{formatReasons(t, pick.reasons)}</p>
      </div>
    </div>
  );
}
