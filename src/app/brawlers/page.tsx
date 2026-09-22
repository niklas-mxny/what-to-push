"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ApiErrorNotice } from "@/components/ApiErrorNotice";
import { BrawlerIcon } from "@/components/BrawlerIcon";
import { GoalProgress } from "@/components/GoalProgress";
import { RoleBadge } from "@/components/RoleBadge";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { goalMetricValue, isGoalless } from "@/lib/goal";
import { useRoster } from "@/lib/hooks";
import { translateApiError, useT } from "@/lib/i18n";
import type { TFunction } from "@/lib/i18n";
import { buildQualityFactor } from "@/lib/recommend";
import { useGoal, usePlayerTag } from "@/lib/storage";
import type { GoalConfig, MergedBrawler } from "@/types/domain";

export default function BrawlersPage() {
  const t = useT();
  const { tag, hydrated } = usePlayerTag();
  const { goal } = useGoal();
  const { data, loading, error } = useRoster(tag, hydrated);
  const [query, setQuery] = useState("");
  const goalless = isGoalless(goal);

  const { inProgress, completed } = useMemo(() => {
    if (!data) return { inProgress: [], completed: [] };
    const filtered = data.roster.filter((b) =>
      b.name.toLowerCase().includes(query.toLowerCase())
    );
    if (goalless) {
      const sorted = filtered
        .map((b) => ({ brawler: b, current: 0, done: false }))
        .sort((a, b) => buildQualityFactor(b.brawler) - buildQualityFactor(a.brawler));
      return { inProgress: sorted, completed: [] };
    }
    const rows = filtered.map((b) => ({
      brawler: b,
      current: goalMetricValue(b, goal),
      done: b.owned && goalMetricValue(b, goal) >= goal.target,
    }));
    // Highest-to-lowest by the goal's own metric (trophies by default) — brawlers
    // closest to the finish line for their current standing show up first.
    const byCurrentDesc = (a: (typeof rows)[number], b: (typeof rows)[number]) => b.current - a.current;
    return {
      inProgress: rows.filter((r) => !r.done).sort(byCurrentDesc),
      completed: rows.filter((r) => r.done).sort(byCurrentDesc),
    };
  }, [data, query, goal, goalless]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{t("brawlers.title")}</h1>
          <p className="text-sm text-muted">
            {goalless
              ? t("brawlers.bestWinrateHint")
              : t("brawlers.progress", { metric: t(`goal.metric.${goal.type}`), target: goal.target })}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border-strong bg-background-elevated px-3 py-2">
          <Search className="h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("brawlers.search")}
            className="bg-transparent text-sm outline-none placeholder:text-muted-2"
          />
        </div>
      </div>

      {data && <GoalProgress roster={data.roster} goal={goal} />}

      {error && <ApiErrorNotice message={translateApiError(t, error)} />}
      {!tag && hydrated && (
        <Card>
          <CardContent>
            <p className="text-sm text-muted">{t("brawlers.noTagHint")}</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-card border border-border bg-card/50" />
          ))}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {inProgress.map((row) => (
            <BrawlerTile key={row.brawler.key} {...row} goal={goal} goalless={goalless} t={t} />
          ))}
        </div>
      )}

      {!loading && !error && completed.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-success">
              {t("brawlers.completedHeading", { count: completed.length })}
            </h2>
            <div className="h-px flex-1 bg-success/20" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {completed.map((row) => (
              <BrawlerTile key={row.brawler.key} {...row} goal={goal} goalless={goalless} t={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BrawlerTile({
  brawler,
  current,
  done,
  goal,
  goalless,
  t,
}: {
  brawler: MergedBrawler;
  current: number;
  done: boolean;
  goal: GoalConfig;
  goalless: boolean;
  t: TFunction;
}) {
  return (
    <Card className={done ? "border-success/25 bg-success/[0.03]" : undefined} interactive>
      <CardContent className="flex flex-col items-center gap-2 p-3 text-center">
        <BrawlerIcon brawler={brawler} size={56} />
        <p className="truncate text-sm font-semibold">{brawler.name}</p>
        <RoleBadge role={brawler.role} />
        {!brawler.owned ? (
          <p className="text-[11px] text-muted-2">{t("brawlers.notUnlocked")}</p>
        ) : goalless ? (
          <p className="text-xs text-muted">
            {brawler.trophies.toLocaleString()} {t("goal.metric.trophies")}
          </p>
        ) : (
          <div className="w-full">
            <div className="mb-1 flex justify-between text-[11px] text-muted">
              <span>
                {t(`goal.metric.${goal.type}`)} {current}
              </span>
              <span>{goal.target}</span>
            </div>
            <ProgressBar value={current} max={goal.target} toneClassName={done ? "bg-success" : "bg-primary"} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
