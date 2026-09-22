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

export interface PlayerBrawler {
  id: number;
  name: string;
  power: number;
  rank: number;
  trophies: number;
  highestTrophies: number;
  gears: SupercellGear[];
  starPowers: SupercellStarPower[];
  gadgets: SupercellGadget[];
}

export interface Player {
  tag: string;
  name: string;
  nameColor: string;
  icon: { id: number };
  trophies: number;
  highestTrophies: number;
  expLevel: number;
  expPoints: number;
  is3vs3Victories: number;
  soloVictories: number;
  duoVictories: number;
  bestRoboRumbleTime: number;
  bestTimeAsBigBrawler: number;
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
