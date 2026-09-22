import type { GoalConfig, MergedBrawler } from "@/types/domain";

/** "none" goal = no per-brawler target at all, pure best-pick-right-now ranking. */
export function isGoalless(goal: GoalConfig): boolean {
  return goal.type === "none";
}

/** Per-brawler value for the goal's metric. Meaningless for "none" — callers must branch on isGoalless() first. */
export function goalMetricValue(b: MergedBrawler, goal: GoalConfig): number {
  switch (goal.type) {
    case "power":
      return b.power;
    case "trophies":
      return b.trophies;
    case "rank":
      return b.rank;
    case "none":
      return 0;
  }
}
