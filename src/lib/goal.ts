import type { GoalConfig, MergedBrawler } from "@/types/domain";

export function goalMetricValue(b: MergedBrawler, goal: GoalConfig): number {
  switch (goal.type) {
    case "power":
      return b.power;
    case "trophies":
      return b.trophies;
    case "rank":
      return b.rank;
  }
}

export const GOAL_METRIC_LABEL: Record<GoalConfig["type"], string> = {
  power: "Power",
  trophies: "Trophäen",
  rank: "Rang",
};
