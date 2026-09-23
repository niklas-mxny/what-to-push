"use client";

import Image from "next/image";
import { Clock } from "lucide-react";
import { BrawlerIcon } from "@/components/BrawlerIcon";
import { BuildIcons } from "@/components/BuildIcons";
import { GameIcon } from "@/components/GameIcon";
import { RoleBadge } from "@/components/RoleBadge";
import { timeUntil } from "@/components/SlotDetails";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { MODE_ICONS } from "@/lib/fankit-ui";
import { formatReasons, useT } from "@/lib/i18n";
import type { SlotRecommendation } from "@/types/domain";

/** One rotation slot. Clicking the map header or any brawler opens the slot view (map + build). */
export function SlotRecommendationCard({
  rec,
  onOpen,
}: {
  rec: SlotRecommendation;
  onOpen: (brawlerKey?: string) => void;
}) {
  const t = useT();
  const top = rec.picks[0];

  return (
    <Card className="overflow-hidden" interactive>
      <div className="relative h-28 w-full bg-background-elevated">
        <button
          type="button"
          onClick={() => onOpen()}
          aria-label={t("slot.open", { mode: rec.slot.modeLabel, map: rec.slot.mapName })}
          className="absolute inset-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        />
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
            <Badge tone="primary">
              {MODE_ICONS[rec.slot.modeKey] && <GameIcon file={MODE_ICONS[rec.slot.modeKey]} size={16} />}
              {rec.slot.modeLabel}
            </Badge>
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
          <div className="relative flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3 transition-colors hover:border-primary/60 hover:bg-primary/15">
            <button
              type="button"
              onClick={() => onOpen(top.brawler.key)}
              aria-label={t("slot.open", { mode: rec.slot.modeLabel, map: rec.slot.mapName })}
              className="absolute inset-0 z-10 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
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
                <button
                  key={pick.brawler.key}
                  type="button"
                  onClick={() => onOpen(pick.brawler.key)}
                  aria-label={pick.brawler.name}
                  title={`${pick.brawler.name} — ${formatReasons(t, pick.reasons)}`}
                  className="group shrink-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <BrawlerIcon
                    brawler={pick.brawler}
                    size={40}
                    className="transition-all duration-200 group-hover:-translate-y-0.5 group-hover:ring-2 group-hover:ring-primary/60"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
