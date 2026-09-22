// Types for the official Supercell Brawl Stars API (api.brawlstars.com).
// Reference: https://developer.brawlstars.com/#/documentation

export interface SupercellStarPower {
  id: number;
  name: string;
}

export interface SupercellGadget {
  id: number;
  name: string;
}

export interface SupercellGear {
  id: number;
  name: string;
  level: number;
}

export interface SupercellHyperCharge {
  id: number;
  name: string;
}

export interface PlayerBrawler {
  id: number;
  name: string;
  power: number;
  rank: number;
  trophies: number;
  highestTrophies: number;
  /** Permanent Prestige tier (Feb 2026 update): 0 = none, 1 at 1000 trophies, 2 at 2000, 3 (max) at 3000. */
  prestigeLevel: number;
  gears: SupercellGear[];
  starPowers: SupercellStarPower[];
  gadgets: SupercellGadget[];
  hyperCharges: SupercellHyperCharge[];
}

export interface Player {
  tag: string;
  name: string;
  nameColor: string;
  icon: { id: number };
  trophies: number;
  highestTrophies: number;
  totalPrestigeLevel: number;
  /** "Fame" (club/season-pass-style progression) — not present on every account. */
  fame?: number;
  fameTierName?: string;
  expLevel: number;
  expPoints: number;
  /** The API's actual field name starts with a digit, so it needs quoting here. */
  "3vs3Victories": number;
  soloVictories: number;
  duoVictories: number;
  bestRoboRumbleTime: number;
  bestTimeAsBigBrawler: number;
  /** Ranked (Power League's successor). Numeric ranks map to an icon: brawlify.com/images/ranked/{58000000 + rank - 1}.png */
  rankedRank?: number;
  rankedRankName?: string;
  rankedElo?: number;
  highestSeasonRankedRank?: number;
  highestSeasonRankedRankName?: string;
  highestSeasonRankedElo?: number;
  highestAllTimeRankedRank?: number;
  highestAllTimeRankedRankName?: string;
  highestAllTimeRankedElo?: number;
  club: { tag: string; name: string } | Record<string, never>;
  brawlers: PlayerBrawler[];
}

export interface RotationEvent {
  startTime: string;
  endTime: string;
  slotId: number;
  event: {
    id: number;
    mode: string;
    map: string;
  };
}

export type EventRotation = RotationEvent[];

export interface SupercellBrawler {
  id: number;
  name: string;
  starPowers: SupercellStarPower[];
  gadgets: SupercellGadget[];
}

export interface SupercellBrawlerList {
  items: SupercellBrawler[];
}

export class SupercellApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public reason?: string
  ) {
    super(message);
    this.name = "SupercellApiError";
  }
}
