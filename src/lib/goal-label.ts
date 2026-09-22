import type { GoalConfig } from "@/types/domain";

type T = (key: string, params?: Record<string, string | number>) => string;

/** Display text for a goal preset: "All brawlers to Prestige N", or the goalless ranking label. */
export function getGoalLabel(t: T, goal: GoalConfig): string {
  if (goal.type === "none") {
    return t("goal.preset.none");
  }
  return t("goal.preset.prestige", { n: goal.target / 1000 });
}
