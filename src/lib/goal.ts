import type { GoalConfig, MergedBrawler } from "@/types/domain";

/** "none" goal = no per-brawler target at all, pure best-pick-right-now ranking. */
export function isGoalless(goal: GoalConfig): boolean {
  return goal.type === "none";
}

/** Per-brawler value for the goal's metric. Meaningless for "none" — callers must branch on isGoalless() first. */
export function goalMetricValue(b: MergedBrawler, goal: GoalConfig): number {
  return goal.type === "trophies" ? b.trophies : 0;
}

/** How many of a player's brawlers (given as their trophy counts) have reached the goal. */
export function countReached(brawlerTrophies: number[], goal: GoalConfig): number {
  if (isGoalless(goal)) return 0;
  return brawlerTrophies.filter((trophies) => trophies >= goal.target).length;
}
