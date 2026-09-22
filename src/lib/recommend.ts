import { goalMetricValue, isGoalless } from "@/lib/goal";
import { getModeInfo } from "@/lib/mode-weights";
import type {
  ActiveSlot,
  GoalConfig,
  MergedBrawler,
  ReasonEntry,
  Recommendation,
  SlotRecommendation,
} from "@/types/domain";

const MAX_POWER = 11;

/**
 * Rewards brawlers that are CLOSE to crossing the goal's next threshold (e.g.
 * 80 trophies short of Prestige 1), not brawlers far from it — finishing an
 * almost-done brawler is more efficient than starting a fresh one from zero.
 * Ranges ~0.4 (just started) to ~1.3 (right at the doorstep); already-reached
 * brawlers get a low-but-nonzero floor so they don't vanish from the list.
 * The "none" goal has no target at all, so this factor is neutral (1) and
 * the pick is driven purely by role fit + build quality.
 */
function proximityFactor(b: MergedBrawler, goal: GoalConfig): number {
  if (isGoalless(goal)) return 1;
  if (!b.owned) return 0.25;
  const current = goalMetricValue(b, goal);
  if (current >= goal.target) return 0.2;
  if (current <= 0) return 0.3;
  return 0.4 + 0.9 * (current / goal.target);
}

/**
 * Proxy for "how strong is this brawler actually right now" (i.e. their real
 * winrate): a higher power level and unlocked Star Power/Gadget mean a more
 * complete kit and better real-match performance than a bare, underleveled
 * brawler — even at the same role fit.
 */
export function buildQualityFactor(b: MergedBrawler): number {
  if (!b.owned) return 0.6;
  let f = 0.6 + 0.5 * (Math.min(b.power, MAX_POWER) / MAX_POWER);
  if (b.starPowers.length > 0) f += 0.12;
  if (b.gadgets.length > 0) f += 0.12;
  return f;
}

/**
 * Stand-in for "winrate on this map/mode": no public API exposes real per-map
 * meta winrates (see README), so this uses our role-fit heuristic instead.
 */
function roleWeight(b: MergedBrawler, modeKey: string): number {
  const { roleWeights } = getModeInfo(modeKey);
  return roleWeights[b.role] ?? 1;
}

export function scoreBrawlerForSlot(
  brawler: MergedBrawler,
  slot: ActiveSlot,
  goal: GoalConfig
): Recommendation {
  const proximity = proximityFactor(brawler, goal);
  const build = buildQualityFactor(brawler);
  const role = roleWeight(brawler, slot.modeKey);
  const ownershipFactor = brawler.owned ? 1 : 0.35;

  const score = proximity * build * role * ownershipFactor;

  const reasons: ReasonEntry[] = [];
  if (brawler.role !== "Unknown") {
    const key =
      role >= 1.4
        ? "reason.roleFitStrong"
        : role >= 1.1
          ? "reason.roleFitGood"
          : role < 0.9
            ? "reason.roleFitWeak"
            : "reason.roleFitNeutral";
    reasons.push({ key, params: { role: brawler.role, mode: slot.modeLabel } });
  }
  if (brawler.owned && brawler.power >= 7 && (brawler.starPowers.length > 0 || brawler.gadgets.length > 0)) {
    reasons.push({ key: "reason.strongBuild", params: { power: brawler.power } });
  }
  if (!brawler.owned) {
    reasons.push({ key: "reason.notUnlocked" });
  } else if (!isGoalless(goal)) {
    const current = goalMetricValue(brawler, goal);
    if (current >= goal.target) {
      reasons.push({ key: "reason.goalReached" });
    } else {
      reasons.push({ key: "reason.closeToGoal", params: { remaining: goal.target - current } });
    }
  }

  return { brawler, score, reasons };
}

export function recommendForSlot(
  slot: ActiveSlot,
  roster: MergedBrawler[],
  goal: GoalConfig,
  topN = 5
): SlotRecommendation {
  const picks = roster
    .map((b) => scoreBrawlerForSlot(b, slot, goal))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
  return { slot, picks };
}

export function recommendForAllSlots(
  slots: ActiveSlot[],
  roster: MergedBrawler[],
  goal: GoalConfig,
  topN = 5
): SlotRecommendation[] {
  return slots.map((slot) => recommendForSlot(slot, roster, goal, topN));
}
