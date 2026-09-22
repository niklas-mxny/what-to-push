import type { BrawlerRole } from "@/types/domain";

interface ModeInfo {
  label: string;
  roleWeights: Partial<Record<BrawlerRole, number>>;
}

const NEUTRAL: Partial<Record<BrawlerRole, number>> = {};

/**
 * Grobe, spielerfahrungs-basierte Gewichtung, wie gut eine Brawler-Rolle zu einem
 * Spielmodus passt (1.0 = neutral) — dient als Stellvertreter für "Winrate auf
 * diesem Modus", da keine öffentliche API echte Meta-Winrate-Daten liefert (siehe
 * README). Modi, die hier fehlen (v.a. PvE-Eventmodi wie Boss Fight, Robo Rumble),
 * fallen auf neutrale Gewichtung zurück.
 */
export const MODE_INFO: Record<string, ModeInfo> = {
  gemGrab: {
    label: "Gem Grab",
    roleWeights: { Controller: 1.8, Support: 1.6, Artillery: 1.4, Marksman: 1.2, DamageDealer: 1.1, Tank: 1.0, Assassin: 0.8 },
  },
  brawlBall: {
    label: "Brawl Ball",
    roleWeights: { Tank: 1.8, Assassin: 1.4, DamageDealer: 1.3, Support: 1.1, Controller: 1.0, Marksman: 0.8, Artillery: 0.7 },
  },
  heist: {
    label: "Heist",
    roleWeights: { DamageDealer: 1.7, Artillery: 1.6, Tank: 1.2, Assassin: 1.1, Marksman: 1.0, Controller: 0.9, Support: 0.8 },
  },
  bounty: {
    label: "Bounty",
    roleWeights: { Marksman: 1.8, Artillery: 1.5, DamageDealer: 1.2, Controller: 1.1, Support: 0.9, Tank: 0.8, Assassin: 0.7 },
  },
  knockout: {
    label: "Knockout",
    roleWeights: { Marksman: 1.6, Artillery: 1.5, Controller: 1.3, DamageDealer: 1.2, Tank: 1.0, Assassin: 0.9, Support: 0.8 },
  },
  hotZone: {
    label: "Hot Zone",
    roleWeights: { Tank: 1.6, Controller: 1.5, Support: 1.3, DamageDealer: 1.2, Assassin: 0.9, Marksman: 0.9, Artillery: 0.8 },
  },
  duels: {
    label: "Duels",
    roleWeights: { DamageDealer: 1.5, Assassin: 1.4, Tank: 1.2, Marksman: 1.1, Artillery: 1.0, Controller: 0.9, Support: 0.8 },
  },
  wipeout: {
    label: "Wipeout",
    roleWeights: { DamageDealer: 1.4, Marksman: 1.3, Controller: 1.3, Artillery: 1.2, Tank: 1.1, Assassin: 1.0, Support: 1.0 },
  },
  basketBrawl: {
    label: "Basket Brawl",
    roleWeights: { Tank: 1.5, Assassin: 1.4, DamageDealer: 1.3, Support: 1.0, Controller: 1.0, Marksman: 0.8, Artillery: 0.7 },
  },
  holdTheTrophy: {
    label: "Hold the Trophy",
    roleWeights: { Tank: 1.6, Support: 1.3, Controller: 1.2, DamageDealer: 1.2, Assassin: 1.0, Marksman: 0.9, Artillery: 0.8 },
  },
  // Solo/Duo/Trio Showdown are collapsed into this one canonical key before
  // scoring (see normalizeModeKey) — Showdown counts as a single mode, not
  // three separate slots. Weights are a blend of the three variants.
  showdown: {
    label: "Showdown",
    roleWeights: { DamageDealer: 1.3, Tank: 1.3, Assassin: 1.2, Support: 1.1, Controller: 1.0, Marksman: 1.0, Artillery: 0.9 },
  },
  brawlBall5v5: {
    label: "Brawl Ball 5v5",
    roleWeights: { Tank: 1.8, Assassin: 1.4, DamageDealer: 1.3, Support: 1.1, Controller: 1.0, Marksman: 0.8, Artillery: 0.7 },
  },
  tagTeam: {
    label: "Tag Team",
    roleWeights: { Support: 1.3, Tank: 1.2, DamageDealer: 1.1 },
  },
  airHockey: {
    label: "Air Hockey",
    roleWeights: { Marksman: 1.3, DamageDealer: 1.2, Tank: 1.1 },
  },
  brawlArena: {
    label: "Brawl Arena",
    roleWeights: { DamageDealer: 1.2, Assassin: 1.1, Tank: 1.1 },
  },
  volleyBrawl: {
    label: "Volley Brawl",
    roleWeights: { Marksman: 1.3, DamageDealer: 1.2, Assassin: 1.1 },
  },
  payload: {
    label: "Payload",
    roleWeights: { Tank: 1.5, DamageDealer: 1.3, Support: 1.1 },
  },
  trophyThieves: {
    label: "Trophy Thieves",
    roleWeights: { Assassin: 1.4, DamageDealer: 1.2, Support: 1.1 },
  },
  loneStar: {
    label: "Lone Star",
    roleWeights: { Tank: 1.3, DamageDealer: 1.2 },
  },
};

/**
 * Raw API mode keys that should be treated as one canonical mode for both
 * slot deduplication (see lib/rotation.ts) and scoring — Showdown counts as
 * a single mode regardless of solo/duo/trio, and the 5v5 Brawl Ball variant
 * uses a lowercase "v" (the raw key's "5V5" produced a garbled label).
 */
const MODE_KEY_ALIASES: Record<string, string> = {
  soloShowdown: "showdown",
  duoShowdown: "showdown",
  trioShowdown: "showdown",
  brawlBall5V5: "brawlBall5v5",
};

export function normalizeModeKey(rawModeKey: string): string {
  return MODE_KEY_ALIASES[rawModeKey] ?? rawModeKey;
}

export function getModeInfo(rawModeKey: string): ModeInfo {
  const modeKey = normalizeModeKey(rawModeKey);
  return MODE_INFO[modeKey] ?? { label: humanizeModeKey(modeKey), roleWeights: NEUTRAL };
}

/** Fallback für unbekannte Modus-Keys: "bigGame" -> "Big Game". */
function humanizeModeKey(modeKey: string): string {
  const spaced = modeKey.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
