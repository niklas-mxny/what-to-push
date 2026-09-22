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

export const DEFAULT_GOAL: GoalConfig = { type: "power", target: 11 };

export const GOAL_PRESETS: { type: GoalType; target: number; label: string }[] = [
  { type: "power", target: 11, label: "Jeden Brawler auf Power 11" },
  { type: "trophies", target: 1000, label: "Jeden Brawler auf 1000+ Trophäen" },
  { type: "rank", target: 30, label: "Jeden Brawler auf Rang 30 (Prestige)" },
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
