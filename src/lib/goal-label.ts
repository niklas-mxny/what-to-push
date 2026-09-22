import type { GoalConfig } from "@/types/domain";

type T = (key: string, params?: Record<string, string | number>) => string;

const PRESTIGE_TARGETS = new Set([1000, 2000, 3000]);

/**
 * Translates any GoalConfig (preset or custom) into display text. Prestige
 * tiers (trophies goal at 1000/2000/3000) get their special "Prestige N"
 * phrasing; everything else falls back to a generic "<metric> to <target>".
 */
export function getGoalLabel(t: T, goal: GoalConfig): string {
  if (goal.type === "trophies" && PRESTIGE_TARGETS.has(goal.target)) {
    return t("goal.preset.prestige", { n: goal.target / 1000 });
  }
  if (goal.type === "totalTrophies") {
    return t("goal.preset.totalTrophies", { n: Math.round(goal.target / 1000) });
  }
  return t(`goal.custom.${goal.type}`, { target: goal.target.toLocaleString() });
}
