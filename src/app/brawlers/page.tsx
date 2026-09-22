"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ApiErrorNotice } from "@/components/ApiErrorNotice";
import { BrawlerIcon } from "@/components/BrawlerIcon";
import { RoleBadge } from "@/components/RoleBadge";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { goalMetricValue, isAccountGoal } from "@/lib/goal";
import { useRoster } from "@/lib/hooks";
import { translateApiError, useT } from "@/lib/i18n";
import { useGoal, usePlayerTag } from "@/lib/storage";

export default function BrawlersPage() {
  const t = useT();
  const { tag, hydrated } = usePlayerTag();
  const { goal } = useGoal();
  const { data, loading, error } = useRoster(tag, hydrated);
  const [query, setQuery] = useState("");
  const accountGoal = isAccountGoal(goal);

  const rows = useMemo(() => {
    if (!data) return [];
    const filtered = data.roster.filter((b) =>
      b.name.toLowerCase().includes(query.toLowerCase())
    );
    if (accountGoal) {
      return filtered
        .map((b) => ({ brawler: b, current: b.trophies, done: false }))
        .sort((a, b) => b.current - a.current);
    }
    return filtered
      .map((b) => ({
        brawler: b,
        current: goalMetricValue(b, goal),
        done: b.owned && goalMetricValue(b, goal) >= goal.target,
      }))
      .sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        if (a.brawler.owned !== b.brawler.owned) return a.brawler.owned ? -1 : 1;
        return a.current / goal.target - b.current / goal.target;
      });
  }, [data, query, goal, accountGoal]);

  const doneCount = rows.filter((r) => r.done).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{t("brawlers.title")}</h1>
          <p className="text-sm text-muted">
            {accountGoal
              ? t("brawlers.accountProgress", { target: goal.target.toLocaleString() })
              : t("brawlers.progress", {
                  metric: t(`goal.metric.${goal.type}`),
                  target: goal.target,
                  done: doneCount,
                  total: rows.length,
                })}
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

      {accountGoal && data?.player && (
        <Card>
          <CardContent className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{data.player.name}</span>
              <span className="text-muted">
                {data.player.trophies.toLocaleString()} / {goal.target.toLocaleString()}
              </span>
            </div>
            <ProgressBar value={data.player.trophies} max={goal.target} />
          </CardContent>
        </Card>
      )}

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
          {rows.map(({ brawler, current, done }) => (
            <Card key={brawler.key} className={done ? "opacity-70" : undefined}>
              <CardContent className="flex flex-col items-center gap-2 p-3 text-center">
                <BrawlerIcon brawler={brawler} size={56} />
                <p className="truncate text-sm font-semibold">{brawler.name}</p>
                <RoleBadge role={brawler.role} />
                {brawler.owned ? (
                  accountGoal ? (
                    <p className="text-xs text-muted">
                      {current.toLocaleString()} {t("goal.metric.trophies")}
                    </p>
                  ) : (
                    <div className="w-full">
                      <div className="mb-1 flex justify-between text-[11px] text-muted">
                        <span>
                          {t(`goal.metric.${goal.type}`)} {current}
                        </span>
                        <span>{goal.target}</span>
                      </div>
                      <ProgressBar
                        value={current}
                        max={goal.target}
                        toneClassName={done ? "bg-success" : "bg-primary"}
                      />
                    </div>
                  )
                ) : (
                  <p className="text-[11px] text-muted-2">{t("brawlers.notUnlocked")}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
