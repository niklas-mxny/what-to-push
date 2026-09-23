"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { Check, Lock } from "lucide-react";
import { AbilityIcon, type AbilityKind } from "@/components/AbilityIcon";
import { BrawlerIcon } from "@/components/BrawlerIcon";
import { GameIcon } from "@/components/GameIcon";
import { RoleBadge } from "@/components/RoleBadge";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";
import { UI_ICONS } from "@/lib/fankit-ui";
import { getGoalLabel } from "@/lib/goal-label";
import { useT } from "@/lib/i18n";
import { useGoal } from "@/lib/storage";
import type { Ability, MergedBrawler } from "@/types/domain";

const PRESTIGE_TIERS = [1000, 2000, 3000];
const MAX_POWER = 11;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-display text-xs font-bold uppercase tracking-wide text-muted-2">{title}</h3>
      {children}
    </section>
  );
}

function AbilityRow({ ability, kind }: { ability: Ability; kind: AbilityKind }) {
  const t = useT();
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3",
        ability.unlocked ? "border-border-strong bg-white/[0.03]" : "border-border bg-transparent"
      )}
    >
      <span
        className={cn("flex h-11 w-11 shrink-0 items-center justify-center", !ability.unlocked && "opacity-40 grayscale")}
      >
        <AbilityIcon kind={kind} src={ability.iconUrl} framed={ability.framed} size={44} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("font-display text-sm font-bold", !ability.unlocked && "text-muted")}>{ability.name}</p>
          {ability.unlocked ? (
            <Badge tone="success">
              <Check className="h-3 w-3" strokeWidth={3} />
              {t("brawler.unlocked")}
            </Badge>
          ) : (
            <Badge tone="muted">
              <Lock className="h-3 w-3" />
              {t("brawler.locked")}
            </Badge>
          )}
        </div>
        {ability.description && <p className="mt-1 text-xs leading-relaxed text-muted">{ability.description}</p>}
      </div>
    </div>
  );
}

function GoalSection({ brawler }: { brawler: MergedBrawler }) {
  const t = useT();
  const { goal } = useGoal();
  const trophies = brawler.trophies;

  // Without a goal, show the way to the next Prestige tier instead.
  const nextTier = PRESTIGE_TIERS.find((tier) => trophies < tier);
  const target = goal.type === "trophies" ? goal.target : nextTier ?? PRESTIGE_TIERS[PRESTIGE_TIERS.length - 1];
  const title =
    goal.type === "trophies"
      ? getGoalLabel(t, goal)
      : nextTier
        ? t("brawler.nextPrestige", { n: PRESTIGE_TIERS.indexOf(nextTier) + 1 })
        : t("brawler.maxPrestige");
  const reached = trophies >= target;

  return (
    <Section title={t("brawler.goalProgress")}>
      <div className="flex flex-col gap-3 rounded-xl border border-border-strong bg-white/[0.03] p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium">{title}</span>
          <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap font-semibold">
            <GameIcon file={UI_ICONS.trophy} size={18} />
            {trophies.toLocaleString()} / {target.toLocaleString()}
          </span>
        </div>
        <ProgressBar
          value={trophies}
          max={target}
          className="h-2.5"
          toneClassName={reached ? "bg-success" : "bg-primary"}
          glowColor={reached ? "var(--success)" : undefined}
        />
        <p className={cn("text-xs", reached ? "font-medium text-success" : "text-muted")}>
          {!brawler.owned
            ? t("brawlers.notUnlocked")
            : reached
              ? t("brawler.goalReached")
              : t("brawler.remaining", { count: (target - trophies).toLocaleString() })}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {PRESTIGE_TIERS.map((tier, i) => {
            const done = brawler.prestigeLevel > i || trophies >= tier;
            return (
              <div
                key={tier}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center",
                  done ? "border-accent/40 bg-accent/10" : "border-border"
                )}
              >
                <span className={cn(!done && "opacity-40 grayscale")}>
                  <GameIcon file={UI_ICONS.prestigeTrophy} size={26} />
                </span>
                <span className={cn("text-xs font-semibold", done ? "text-accent" : "text-muted")}>
                  {t("brawler.prestige", { n: i + 1 })}
                </span>
                <span className="text-[10px] text-muted-2">{tier.toLocaleString()}</span>
              </div>
            );
          })}
        </div>

        {brawler.owned && brawler.highestTrophies > trophies && (
          <p className="text-xs text-muted-2">
            {t("brawler.highest", { trophies: brawler.highestTrophies.toLocaleString() })}
          </p>
        )}
      </div>
    </Section>
  );
}

/** Everything about one brawler: goal progress, full kit (unlocked or not) and gears. */
export function BrawlerDetails({ brawler }: { brawler: MergedBrawler }) {
  const t = useT();

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-4 pe-8">
        <BrawlerIcon brawler={brawler} size={80} className="glow-ring-accent ring-2 ring-accent/60" />
        <div className="min-w-0">
          <h2 className="truncate font-display text-2xl font-bold">{brawler.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <RoleBadge role={brawler.role} />
            {brawler.rarity && <Badge>{brawler.rarity}</Badge>}
            {brawler.owned ? (
              <Badge tone="primary">{t("brawler.power", { power: brawler.power, max: MAX_POWER })}</Badge>
            ) : (
              <Badge tone="muted">
                <Lock className="h-3 w-3" />
                {t("brawlers.notUnlocked")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <GoalSection brawler={brawler} />

      <Section title={t("brawler.gadgets")}>
        {brawler.kit.gadgets.map((a) => (
          <AbilityRow key={a.id} ability={a} kind="gadget" />
        ))}
      </Section>

      <Section title={t("brawler.starPowers")}>
        {brawler.kit.starPowers.map((a) => (
          <AbilityRow key={a.id} ability={a} kind="starPower" />
        ))}
      </Section>

      <Section title={t("build.hypercharge")}>
        {brawler.kit.hyperCharges.length > 0 ? (
          brawler.kit.hyperCharges.map((a) => (
            <AbilityRow key={a.id} ability={a} kind="hypercharge" />
          ))
        ) : (
          <p className="text-sm text-muted">{t("brawler.noHypercharge")}</p>
        )}
      </Section>

      {brawler.owned && (
        <Section title={t("brawler.gears")}>
          {brawler.gears.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {brawler.gears.map((g) => (
                <span
                  key={g.id}
                  className="flex items-center gap-2 rounded-full border border-border-strong bg-white/[0.03] py-1 pe-3 ps-1"
                >
                  <GameIcon src={g.iconUrl} alt="" size={26} />
                  <span className="text-xs font-medium">{g.name}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">{t("brawler.noGears")}</p>
          )}
        </Section>
      )}
    </div>
  );
}

const OpenBrawlerContext = createContext<(brawler: MergedBrawler) => void>(() => {});

/** Hosts the one brawler details popup; any brawler on the page can open it via useOpenBrawlerDetails(). */
export function BrawlerDetailsProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const [brawler, setBrawler] = useState<MergedBrawler | null>(null);

  return (
    <OpenBrawlerContext.Provider value={setBrawler}>
      {children}
      <Modal
        open={brawler !== null}
        onClose={() => setBrawler(null)}
        label={brawler ? t("brawler.details", { name: brawler.name }) : ""}
        closeLabel={t("brawler.close")}
      >
        {brawler && <BrawlerDetails brawler={brawler} />}
      </Modal>
    </OpenBrawlerContext.Provider>
  );
}

export function useOpenBrawlerDetails(): (brawler: MergedBrawler) => void {
  return useContext(OpenBrawlerContext);
}
