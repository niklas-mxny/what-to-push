// Types for the community BrawlAPI (api.brawlapi.com) — used only for
// metadata that the official Supercell API doesn't expose (brawler class,
// rarity, icons). No API key required, no live event data (see lib/brawlapi.ts).

export interface BrawlApiClass {
  id: number;
  name: string;
}

export interface BrawlApiRarity {
  id: number;
  name: string;
  color: string;
}

export interface BrawlApiStarPower {
  id: number;
  name: string;
  imageUrl: string;
}

export interface BrawlApiGadget {
  id: number;
  name: string;
  imageUrl: string;
}

export interface BrawlApiBrawler {
  id: number;
  name: string;
  class: BrawlApiClass;
  rarity: BrawlApiRarity;
  imageUrl: string;
  imageUrl2: string;
  released: boolean;
  starPowers: BrawlApiStarPower[];
  gadgets: BrawlApiGadget[];
}

export interface BrawlApiBrawlerList {
  list: BrawlApiBrawler[];
}
