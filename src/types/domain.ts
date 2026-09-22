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
// "none" = no target at all — pure "best pick right now" ranking by role fit
// (winrate stand-in) and build quality, with no goal-proximity factor.
export type GoalType = "power" | "trophies" | "rank" | "none";

export interface GoalConfig {
  type: GoalType;
  target: number;
}

// Prestige (added in the Feb 2026 update): a brawler's first 1000 trophies
// become permanent (no season reset) at Prestige 1, 2000 at Prestige 2, 3000
// at Prestige 3 (max) — so Prestige tiers are just the `trophies` goal type
// at fixed thresholds. The API also exposes this directly as `prestigeLevel`.
export const DEFAULT_GOAL: GoalConfig = { type: "trophies", target: 1000 };

export const GOAL_PRESETS: { type: GoalType; target: number }[] = [
  { type: "trophies", target: 1000 },
  { type: "trophies", target: 2000 },
  { type: "trophies", target: 3000 },
  { type: "none", target: 0 },
];

/** An unlocked gadget/star power/gear/hypercharge, with an icon when we have one. */
export interface UnlockedUpgrade {
  id: number;
  name: string;
  iconUrl?: string;
}

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
  /** 0-3; also directly reported by the API, not just derived from trophies. */
  prestigeLevel: number;
  starPowers: UnlockedUpgrade[];
  starPowersTotal: number;
  gadgets: UnlockedUpgrade[];
  gadgetsTotal: number;
  gears: UnlockedUpgrade[];
  hyperCharges: UnlockedUpgrade[];
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
