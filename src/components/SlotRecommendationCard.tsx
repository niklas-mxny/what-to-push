"use client";

import Image from "next/image";
import { Clock } from "lucide-react";
import { BrawlerIcon } from "@/components/BrawlerIcon";
import { BuildIcons } from "@/components/BuildIcons";
import { RoleBadge } from "@/components/RoleBadge";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatReasons, useT } from "@/lib/i18n";
import type { TFunction } from "@/lib/i18n";
import type { SlotRecommendation } from "@/types/domain";

function timeUntil(t: TFunction, iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  if (diffMs <= 0) return t("time.endingSoon");
  const hours = Math.floor(diffMs / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  if (hours >= 24) return t("time.days", { d: Math.floor(hours / 24), h: hours % 24 });
  if (hours > 0) return t("time.hours", { h: hours, m: minutes });
  return t("time.minutes", { m: minutes });
}

export function SlotRecommendationCard({ rec }: { rec: SlotRecommendation }) {
  const t = useT();
  const top = rec.picks[0];

  return (
    <Card className="overflow-hidden">
      <div className="relative h-28 w-full bg-background-elevated">
        {rec.slot.mapImageUrl && (
          <Image
            src={rec.slot.mapImageUrl}
            alt={rec.slot.mapName}
            fill
            unoptimized
            className="object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
          <div>
            <Badge tone="primary">{rec.slot.modeLabel}</Badge>
            <p className="mt-1 font-display text-lg font-bold leading-tight">
              {rec.slot.mapName}
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-xs text-muted backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            {timeUntil(t, rec.slot.endTime)}
          </span>
        </div>
      </div>

      <CardContent className="flex flex-col gap-4">
        {top ? (
          <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3">
            <BrawlerIcon brawler={top.brawler} size={52} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-display text-base font-bold">{top.brawler.name}</p>
                <RoleBadge role={top.brawler.role} />
              </div>
              <p className="truncate text-xs text-muted">{formatReasons(t, top.reasons)}</p>
              <div className="mt-2">
                <BuildIcons brawler={top.brawler} />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">{t("dashboard.noRecommendation")}</p>
        )}

        {rec.picks.length > 1 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-2">
              {t("dashboard.moreOptions")}
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
              {rec.picks.slice(1).map((pick) => (
                <div
                  key={pick.brawler.key}
                  className="flex shrink-0 flex-col items-center gap-1"
                  title={formatReasons(t, pick.reasons)}
                >
                  <BrawlerIcon brawler={pick.brawler} size={36} />
                  <span className="max-w-[3.5rem] truncate text-[11px] text-muted">
                    {pick.brawler.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
