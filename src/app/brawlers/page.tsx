"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ApiErrorNotice } from "@/components/ApiErrorNotice";
import { BrawlerIcon } from "@/components/BrawlerIcon";
import { RoleBadge } from "@/components/RoleBadge";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { GOAL_METRIC_LABEL, goalMetricValue } from "@/lib/goal";
import { useRoster } from "@/lib/hooks";
import { useGoal, usePlayerTag } from "@/lib/storage";

export default function BrawlersPage() {
  const { tag, hydrated } = usePlayerTag();
  const { goal } = useGoal();
  const { data, loading, error } = useRoster(tag, hydrated);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    if (!data) return [];
    const filtered = data.roster.filter((b) =>
      b.name.toLowerCase().includes(query.toLowerCase())
    );
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
  }, [data, query, goal]);

  const doneCount = rows.filter((r) => r.done).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Deine Brawler</h1>
          <p className="text-sm text-muted">
            Fortschritt Richtung Ziel: {GOAL_METRIC_LABEL[goal.type]} {goal.target}
            {data ? ` · ${doneCount}/${rows.length} erreicht` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border-strong bg-background-elevated px-3 py-2">
          <Search className="h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Brawler suchen…"
            className="bg-transparent text-sm outline-none placeholder:text-muted-2"
          />
        </div>
      </div>

      {error && <ApiErrorNotice message={error} />}
      {!tag && hydrated && (
        <Card>
          <CardContent>
            <p className="text-sm text-muted">
              Ohne Spieler-Tag (siehe Einstellungen) zeigen wir hier nur die allgemeine
              Brawler-Liste ohne deinen Fortschritt.
            </p>
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
                  <div className="w-full">
                    <div className="mb-1 flex justify-between text-[11px] text-muted">
                      <span>
                        {GOAL_METRIC_LABEL[goal.type]} {current}
                      </span>
                      <span>{goal.target}</span>
                    </div>
                    <ProgressBar
                      value={current}
                      max={goal.target}
                      toneClassName={done ? "bg-success" : "bg-primary"}
                    />
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-2">Nicht freigeschaltet</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
