import { goalMetricValue } from "@/lib/goal";
import { getModeInfo } from "@/lib/mode-weights";
import type { ActiveSlot, GoalConfig, MergedBrawler, Recommendation, SlotRecommendation } from "@/types/domain";

/** 0 = Ziel bereits erreicht/übertroffen, 1 = maximal weit vom Ziel entfernt. */
function goalGap(b: MergedBrawler, goal: GoalConfig): number {
  if (!b.owned) return 1;
  const current = goalMetricValue(b, goal);
  if (current >= goal.target) return 0;
  return (goal.target - current) / goal.target;
}

function roleWeight(b: MergedBrawler, modeKey: string): number {
  const { roleWeights } = getModeInfo(modeKey);
  return roleWeights[b.role] ?? 1;
}

/**
 * Trophäen werden mit steigendem Trophäenstand tendenziell schwerer zu gewinnen
 * (stärkere Gegner). Brawler mit niedrigerem Stand bekommen daher einen leichten
 * Bonus, wenn das Trophäen-Ziel aktiv ist — sie lassen sich gerade "leichter pushen".
 */
function pushEaseBonus(b: MergedBrawler, goal: GoalConfig): number {
  if (goal.type !== "trophies" || !b.owned) return 1;
  if (b.trophies >= 750) return 0.9;
  if (b.trophies >= 500) return 1.0;
  return 1.15;
}

export function scoreBrawlerForSlot(
  brawler: MergedBrawler,
  slot: ActiveSlot,
  goal: GoalConfig
): Recommendation {
  const gap = goalGap(brawler, goal);
  const role = roleWeight(brawler, slot.modeKey);
  const ease = pushEaseBonus(brawler, goal);
  const ownershipFactor = brawler.owned ? 1 : 0.35;

  // Basiswert 0.2 verhindert, dass fertige Brawler (gap=0) auf 0 fallen — sie sind
  // dann einfach kein guter Pick mehr, sollen aber nicht komplett verschwinden.
  const score = (0.2 + gap) * role * ease * ownershipFactor;

  const reasons: string[] = [];
  if (!brawler.owned) {
    reasons.push("Noch nicht freigeschaltet");
  } else if (gap === 0) {
    reasons.push("Ziel bei diesem Brawler bereits erreicht");
  } else {
    reasons.push(`Noch ${Math.round(gap * 100)}% bis zum Ziel offen`);
  }
  if (brawler.role !== "Unbekannt") {
    const fit = role >= 1.4 ? "starke" : role >= 1.1 ? "gute" : role < 0.9 ? "schwache" : "neutrale";
    reasons.push(`${fit} Rolle (${brawler.role}) für ${slot.modeLabel}`);
  }
  if (ease > 1) {
    reasons.push("Niedriger Trophäenstand — leichter zu pushen");
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
