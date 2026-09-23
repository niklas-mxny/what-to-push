"use client";

import { useState } from "react";
import Image from "next/image";
import { Clock, Map as MapIcon } from "lucide-react";
import { AbilityIcon, type AbilityKind } from "@/components/AbilityIcon";
import { useOpenBrawlerDetails } from "@/components/BrawlerDetails";
import { BrawlerIcon } from "@/components/BrawlerIcon";
import { GameIcon } from "@/components/GameIcon";
import { RoleBadge } from "@/components/RoleBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { MODE_ICONS, UI_ICONS } from "@/lib/fankit-ui";
import { formatReasons, useT } from "@/lib/i18n";
import type { TFunction } from "@/lib/i18n";
import type { Ability, MergedBrawler, SlotRecommendation } from "@/types/domain";

export function timeUntil(t: TFunction, iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  if (diffMs <= 0) return t("time.endingSoon");
  const hours = Math.floor(diffMs / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  if (hours >= 24) return t("time.days", { d: Math.floor(hours / 24), h: hours % 24 });
  if (hours > 0) return t("time.hours", { h: hours, m: minutes });
  return t("time.minutes", { m: minutes });
}

function AbilityTile({ ability, kind }: { ability: Ability; kind: AbilityKind }) {
  const t = useT();
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border p-2",
        ability.unlocked ? "border-border-strong bg-white/[0.03]" : "border-border"
      )}
      title={ability.description}
    >
      <span className={cn(!ability.unlocked && "opacity-40 grayscale")}>
        <AbilityIcon kind={kind} src={ability.iconUrl} framed={ability.framed} size={36} />
      </span>
      <div className="min-w-0">
        <p className={cn("truncate font-display text-xs font-bold", !ability.unlocked && "text-muted")}>
          {ability.name}
        </p>
        <p className={cn("text-[11px]", ability.unlocked ? "text-success" : "text-muted-2")}>
          {ability.unlocked ? t("brawler.unlocked") : t("brawler.locked")}
        </p>
      </div>
    </div>
  );
}

/**
 * The selected brawler's build options: every gadget, star power and
 * hypercharge (unlocked or not) plus the unlocked gears. It deliberately
 * doesn't pick a "best" build — the official API doesn't reveal which gadget
 * or star power was played, so there's no data to rank them by yet.
 */
function BuildPanel({ brawler }: { brawler: MergedBrawler }) {
  const t = useT();
  const groups: { kind: AbilityKind; title: string; abilities: Ability[] }[] = [
    { kind: "gadget", title: t("brawler.gadgets"), abilities: brawler.kit.gadgets },
    { kind: "starPower", title: t("brawler.starPowers"), abilities: brawler.kit.starPowers },
    { kind: "hypercharge", title: t("build.hypercharge"), abilities: brawler.kit.hyperCharges },
  ];

  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-display text-xs font-bold uppercase tracking-wide text-muted-2">{t("slot.build")}</h3>
      {groups
        .filter((g) => g.abilities.length > 0)
        .map((g) => (
          <div key={g.kind} className="flex flex-col gap-1.5">
            <p className="text-[11px] font-medium text-muted">{g.title}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {g.abilities.map((a) => (
                <AbilityTile key={a.id} ability={a} kind={g.kind} />
              ))}
            </div>
          </div>
        ))}
      {brawler.owned && brawler.gears.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-medium text-muted">{t("brawler.gears")}</p>
          <div className="flex flex-wrap gap-2">
            {brawler.gears.map((g) => (
              <span
                key={g.id}
                className="flex items-center gap-1.5 rounded-full border border-border-strong bg-white/[0.03] py-0.5 pe-2.5 ps-0.5"
              >
                <GameIcon src={g.iconUrl} alt="" size={22} />
                <span className="text-[11px] font-medium">{g.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function SlotDetails({
  rec,
  initialBrawlerKey,
  onClose,
}: {
  rec: SlotRecommendation;
  initialBrawlerKey?: string;
  onClose: () => void;
}) {
  const t = useT();
  const openDetails = useOpenBrawlerDetails();
  const [selectedKey, setSelectedKey] = useState(initialBrawlerKey ?? rec.picks[0]?.brawler.key);
  const selected = rec.picks.find((p) => p.brawler.key === selectedKey) ?? rec.picks[0];
  const modeIcon = MODE_ICONS[rec.slot.modeKey];

  return (
    <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="flex flex-col gap-3">
        <div className="pe-8 md:pe-0">
          <Badge tone="primary">
            {modeIcon && <GameIcon file={modeIcon} size={16} />}
            {rec.slot.modeLabel}
          </Badge>
          <h2 className="mt-1 font-display text-2xl font-bold leading-tight">{rec.slot.mapName}</h2>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3 w-3" />
            {timeUntil(t, rec.slot.endTime)}
          </p>
        </div>
        <div className="flex w-full items-center justify-center overflow-hidden rounded-xl border border-border-strong bg-background">
          {rec.slot.mapImageUrl ? (
            // Map art is tall for 3v3 and square for Showdown — keep its own proportions.
            <Image
              src={rec.slot.mapImageUrl}
              alt={rec.slot.mapName}
              width={1000}
              height={1000}
              unoptimized
              style={{ width: "100%", height: "auto" }}
              className="max-h-[45vh] object-contain md:max-h-[65vh]"
            />
          ) : (
            <div className="flex aspect-[3/4] w-full items-center justify-center">
              <MapIcon className="h-10 w-10 text-muted-2" />
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        {selected ? (
          <>
            <div className="flex flex-col gap-3 md:pe-8">
              <div className="flex items-center gap-3">
                <BrawlerIcon brawler={selected.brawler} size={64} className="glow-ring-accent ring-2 ring-accent/60" />
                <div className="min-w-0">
                  <p className="truncate font-display text-xl font-bold">{selected.brawler.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <RoleBadge role={selected.brawler.role} />
                    {selected.brawler.owned && (
                      <>
                        <Badge tone="primary">{t("brawler.power", { power: selected.brawler.power, max: 11 })}</Badge>
                        <Badge>
                          <GameIcon file={UI_ICONS.trophy} size={14} />
                          {selected.brawler.trophies.toLocaleString()}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted">{formatReasons(t, selected.reasons)}</p>
              <Button
                size="sm"
                variant="secondary"
                className="self-start"
                onClick={() => {
                  onClose();
                  openDetails(selected.brawler);
                }}
              >
                {t("slot.allDetails")}
              </Button>
            </div>

            <BuildPanel brawler={selected.brawler} />

            {rec.picks.length > 1 && (
              <section className="flex flex-col gap-2">
                <h3 className="font-display text-xs font-bold uppercase tracking-wide text-muted-2">
                  {t("slot.options")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {rec.picks.map((pick, i) => {
                    const active = pick.brawler.key === selected.brawler.key;
                    return (
                      <button
                        key={pick.brawler.key}
                        type="button"
                        onClick={() => setSelectedKey(pick.brawler.key)}
                        aria-pressed={active}
                        aria-label={pick.brawler.name}
                        title={`${pick.brawler.name} — ${formatReasons(t, pick.reasons)}`}
                        className="relative rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <BrawlerIcon
                          brawler={pick.brawler}
                          size={48}
                          className={cn(
                            "transition-all duration-200 hover:-translate-y-0.5",
                            active ? "ring-2 ring-accent" : "hover:ring-2 hover:ring-primary/60"
                          )}
                        />
                        {i === 0 && (
                          <span className="absolute -top-1.5 start-1/2 -translate-x-1/2 rounded-full bg-accent px-1.5 text-[9px] font-bold uppercase text-accent-foreground rtl:translate-x-1/2">
                            {t("slot.top")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">{t("dashboard.noRecommendation")}</p>
        )}
      </div>
    </div>
  );
}

/** Map + brawler + build view for one rotation slot. */
export function SlotDetailsModal({
  rec,
  initialBrawlerKey,
  onClose,
}: {
  rec: SlotRecommendation | null;
  initialBrawlerKey?: string;
  onClose: () => void;
}) {
  const t = useT();
  return (
    <Modal
      open={rec !== null}
      onClose={onClose}
      label={rec ? `${rec.slot.modeLabel} · ${rec.slot.mapName}` : ""}
      closeLabel={t("brawler.close")}
      className="max-w-4xl"
    >
      {rec && (
        <SlotDetails
          key={`${rec.slot.slotId}-${initialBrawlerKey ?? ""}`}
          rec={rec}
          initialBrawlerKey={initialBrawlerKey}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}
