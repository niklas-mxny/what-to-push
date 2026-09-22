// Domain types for What to Push — everything specific to our own app logic,
// independent of the upstream API shapes.

export type BrawlerRole =
  | "Tank"
  | "Damage Dealer"
  | "Marksman"
  | "Artillery"
  | "Assassin"
  | "Support"
  | "Controller"
  | "Unbekannt";

export type GoalType = "power" | "trophies" | "rank";

export interface GoalConfig {
  type: GoalType;
  target: number;
}

// Prestige (seit dem Februar-2026-Update): ab 1000 Trophäen auf einem Brawler
// werden die ersten 1000 dauerhaft ("Prestige 1"), ab 2000 "Prestige 2", ab
// 3000 "Prestige 3" (Maximum). Prestige ist also Trophäen-basiert, nicht an
// den separaten "Rang"-Wert gekoppelt.
export const DEFAULT_GOAL: GoalConfig = { type: "trophies", target: 1000 };

export const GOAL_PRESETS: { type: GoalType; target: number; label: string }[] = [
  { type: "trophies", target: 1000, label: "Alle Brawler auf Prestige 1" },
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

export interface Recommendation {
  brawler: MergedBrawler;
  score: number;
  reasons: string[];
}

export interface SlotRecommendation {
  slot: ActiveSlot;
  picks: Recommendation[];
}
