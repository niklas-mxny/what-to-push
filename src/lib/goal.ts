import type { GoalConfig, MergedBrawler } from "@/types/domain";

export function isAccountGoal(goal: GoalConfig): boolean {
  return goal.type === "totalTrophies";
}

/** Per-brawler value for the goal's metric. Meaningless for "totalTrophies" (account-wide) — callers must branch on isAccountGoal() first. */
export function goalMetricValue(b: MergedBrawler, goal: GoalConfig): number {
  switch (goal.type) {
    case "power":
      return b.power;
    case "trophies":
    case "totalTrophies":
      return b.trophies;
    case "rank":
      return b.rank;
  }
}

/** The account-wide value for an account-scoped goal (currently just totalTrophies). */
export function accountMetricValue(player: { trophies: number } | null, goal: GoalConfig): number | null {
  if (!isAccountGoal(goal)) return null;
  return player?.trophies ?? null;
}

/** i18n key suffix: `goal.metric.${type}` */
export const GOAL_METRIC_KEY: Record<GoalConfig["type"], string> = {
  power: "power",
  trophies: "trophies",
  rank: "rank",
  totalTrophies: "totalTrophies",
};
