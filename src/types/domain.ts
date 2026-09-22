// Domain types for What to Push — everything specific to our own app logic,
// independent of the upstream API shapes.

// Identifiers double as i18n keys (`role.${BrawlerRole}`), so they're plain
// camelCase-ish tokens rather than display strings — translate at render time.
export type BrawlerRole =
  | "Tank"
  | "DamageDealer"
  | "Marksman"
  | "Artillery"
  | "Assassin"
  | "Support"
  | "Controller"
  | "Unknown";

// "trophies" = per-brawler Prestige progress (1000/2000/3000 thresholds).
// "totalTrophies" = account-wide trophy count, not tied to a single brawler.
export type GoalType = "power" | "trophies" | "rank" | "totalTrophies";

export interface GoalConfig {
  type: GoalType;
  target: number;
}

// Prestige (added in the Feb 2026 update): a brawler's first 1000 trophies
// become permanent (no season reset) at Prestige 1, 2000 at Prestige 2, 3000
// at Prestige 3 (max) — so Prestige tiers are just the `trophies` goal type
// at fixed thresholds. "Total trophies" is a separate, account-wide goal.
export const DEFAULT_GOAL: GoalConfig = { type: "trophies", target: 1000 };

export const GOAL_PRESETS: { type: GoalType; target: number }[] = [
  { type: "trophies", target: 1000 },
  { type: "trophies", target: 2000 },
  { type: "trophies", target: 3000 },
  { type: "totalTrophies", target: 100_000 },
  { type: "totalTrophies", target: 200_000 },
  { type: "totalTrophies", target: 300_000 },
];

export interface MergedBrawler {
  /** Normalized (uppercase) name — stable join key across both APIs. */
  key: string;
  id: number;
  name: string;
  role: BrawlerRole;
  rarity?: string;
  iconUrl?: string;
  owned: boolean;
  power: number;
  rank: number;
  trophies: number;
  highestTrophies: number;
  starPowersUnlocked: number;
  starPowersTotal: number;
  gadgetsUnlocked: number;
  gadgetsTotal: number;
  gearsUnlocked: number;
}

export interface ActiveSlot {
  slotId: number;
  modeKey: string;
  modeLabel: string;
  mapName: string;
  mapImageUrl?: string;
  endTime: string;
}

/** A translation key + interpolation params, resolved to text at render time via t(). */
export interface ReasonEntry {
  key: string;
  params?: Record<string, string | number>;
}

export interface Recommendation {
  brawler: MergedBrawler;
  score: number;
  reasons: ReasonEntry[];
}

export interface SlotRecommendation {
  slot: ActiveSlot;
  picks: Recommendation[];
}
