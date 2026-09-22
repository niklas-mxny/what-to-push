"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { goalMetricValue, isGoalless } from "@/lib/goal";
import { useT } from "@/lib/i18n";
import type { GoalConfig, MergedBrawler } from "@/types/domain";

export function GoalProgress({ roster, goal }: { roster: MergedBrawler[]; goal: GoalConfig }) {
  const t = useT();
  if (isGoalless(goal) || roster.length === 0) return null;

  const done = roster.filter((b) => b.owned && goalMetricValue(b, goal) >= goal.target).length;
  const total = roster.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs text-muted">
        <span>{t("goal.progressLabel", { done, total })}</span>
        <span>{pct}%</span>
      </div>
      <ProgressBar value={done} max={total} />
    </div>
  );
}
