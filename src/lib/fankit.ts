import "server-only";

// Official Supercell Fan Kit (a public Frontify portal): the original in-game
// icons for gadgets, star powers, hypercharges and gears, plus brawler portraits.
// Assets are served from Frontify's CDN with a resizable width, so nothing is
// downloaded or rehosted — we only map each brawler to the right asset URLs.
// Fixed UI icons (trophy, ranks, modes, …) live in src/lib/fankit-ui.ts.
const SEARCH_URL = "https://fankit.supercell.com/api/assets/search/324";
const ICON_WIDTH = 128;

type AssetType = "Gadgets" | "Star Powers" | "Hypercharge" | "Gears" | "Brawler Portraits";

interface FanKitAsset {
  title: string;
  generic_url: string;
  width: number;
  height: number;
}

interface SearchPage {
  data: FanKitAsset[];
  hasMore: boolean;
}

export interface FanKitIcons {
  /** Brawler key → icon URL per ability slot (index 0 = the brawler's lowest-ID gadget). */
  gadgets: Record<string, (string | undefined)[]>;
  starPowers: Record<string, (string | undefined)[]>;
  hypercharges: Record<string, string>;
  /** Asset title (e.g. "gear_superrare_speed") → icon URL. */
  gears: Record<string, string>;
  /** Brawler key → in-game portrait (landscape art; display it square with object-cover). */
  portraits: Record<string, string>;
}

// Everything below was checked by eye against each ability's name and the
// previous per-ID icons; the fan kit's own numbering is right for all other brawlers.

/** Brawlers whose fan kit _01/_02 is the reverse of the API's ID order. */
const SWAPPED_GADGETS = new Set(["LARRYLAWRIE"]);
const SWAPPED_STAR_POWERS = new Set(["BONNIE", "JANET", "PIPER"]);

/** Mislabeled assets (the art shows a different ability) — the fallback icon is used instead. */
const EXCLUDED_TITLES = new Set(["starpower_amber_1", "max_starpower_01"]);

/** Assets named after the ability rather than numbered: brawler → name token → slot. */
const NAMED_GADGET_SLOTS: Record<string, Record<string, number>> = {
  DAMIAN: { thirsty: 1, builder: 2 },
  STARRNOVA: { fluffytime: 1 },
};

/** Fan kit short names that don't match the brawler's in-game name. */
const BRAWLER_ALIASES: Record<string, string> = {
  PRIMO: "ELPRIMO",
  TWINS: "LARRYLAWRIE",
  JAE: "JAEYONG",
  RUFF: "RUFFS",
};

/** Stable join key for brawler names across APIs: uppercase letters/digits only ("Mr. P" → "MRP"). */
export function brawlerKey(name: string): string {
  const key = name.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return BRAWLER_ALIASES[key] ?? key;
}

// Title patterns, best first. Titles are lowercased; `b` = brawler, `n` = slot.
const GADGET_PATTERNS = [
  /^(?<b>.+?)_(?:gadget|gd)_?0?(?<n>[12])(?<icon>_icon)?$/, // shelly_gadget_01, bolt_gd1_icon
  /^gadget_(?<b>.+?)_(?<n>[12])(?<variant>_1)?$/, // gadget_vince_1, gadget_wendy_2_1
  /^gadget(?<n>[12])_(?<b>.+)$/, // gadget1_glowy
  /^(?<b>.+?)_gadget(?<n>2?)$/, // najia_gadget, najia_gadget2
];
const STAR_POWER_PATTERNS = [
  /^(?<b>.+?)_+(?:starpower|starrpower|sp)_?0?(?<n>[12])$/, // shelly_starpower_01, bolt_sp1
  /^(?:icon_sp|sp|starpower)_(?<b>.+?)_(?<n>[12])(?<variant>_1)?$/, // sp_nori_1, icon_sp_damian_2
  /^starr?power(?<n>[12])_(?<b>.+)$/, // starrpower1_glowy
  /^(?<b>.+?)_starpower(?<n>2?)$/, // najia_starpower
];
const NAMED_GADGET_PATTERN = /^(?<b>.+?)_gadget_(?<name>[a-z]+)(?:_icon)?$/;
const HYPERCHARGE_PATTERNS = [/^(?<b>.+?)_hypercharge$/, /^hc_(?<b>[a-z]+?)\d*(?:_.*)?$/];
const PORTRAIT_PATTERN = /^(?:portrait_(?<b>.+)|(?<b2>.+)_portrait)$/;

async function fetchAssets(type: AssetType): Promise<FanKitAsset[]> {
  const assets: FanKitAsset[] = [];
  for (let page = 1; page <= 20; page++) {
    const params = new URLSearchParams({ limit: "100", page: String(page), order: "NEWEST", "asset-type18": type });
    const res = await fetch(`${SEARCH_URL}?${params}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`Fan Kit error: ${res.status} ${res.statusText}`);
    const body = (await res.json()) as SearchPage;
    assets.push(...body.data);
    if (!body.hasMore) break;
  }
  return assets;
}

function iconUrl(asset: FanKitAsset, width = ICON_WIDTH): string {
  return asset.generic_url.replace("{width}", String(width));
}

/** Assigns numbered ability assets to slots, keeping the best-ranked title per slot. */
function buildSlots(
  assets: FanKitAsset[],
  patterns: RegExp[],
  swapped: Set<string>,
  named: Record<string, Record<string, number>> = {}
): Record<string, (string | undefined)[]> {
  const best = new Map<string, { rank: number; url: string }>();
  const consider = (key: string, slot: number, rank: number, url: string) => {
    const id = `${key}:${slot}`;
    const prev = best.get(id);
    if (!prev || rank < prev.rank) best.set(id, { rank, url });
  };

  for (const asset of assets) {
    const title = asset.title.toLowerCase();
    if (EXCLUDED_TITLES.has(title)) continue;

    const matched = patterns.some((pattern, index) => {
      const m = pattern.exec(title)?.groups;
      if (!m) return false;
      const rank = index * 4 + (m.variant ? 2 : 0) - (m.icon ? 1 : 0);
      consider(brawlerKey(m.b), Number(m.n || 1), rank, iconUrl(asset));
      return true;
    });
    if (matched) continue;

    const m = NAMED_GADGET_PATTERN.exec(title)?.groups;
    if (!m) continue;
    const key = brawlerKey(m.b);
    const slot = named[key]?.[m.name];
    if (slot) consider(key, slot, title.endsWith("_icon") ? 0 : 1, iconUrl(asset));
  }

  const slots: Record<string, (string | undefined)[]> = {};
  for (const [id, { url }] of best) {
    const [key, slotText] = id.split(":");
    let slot = Number(slotText);
    if (swapped.has(key)) slot = 3 - slot;
    (slots[key] ??= [])[slot - 1] = url;
  }
  return slots;
}

function buildHypercharges(assets: FanKitAsset[]): Record<string, string> {
  const best = new Map<string, { rank: number; url: string }>();
  for (const asset of assets) {
    const title = asset.title.toLowerCase();
    HYPERCHARGE_PATTERNS.some((pattern, rank) => {
      const b = pattern.exec(title)?.groups?.b;
      if (!b) return false;
      const key = brawlerKey(b);
      const prev = best.get(key);
      if (!prev || rank < prev.rank) best.set(key, { rank, url: iconUrl(asset) });
      return true;
    });
  }
  return Object.fromEntries([...best].map(([key, { url }]) => [key, url]));
}

/**
 * One portrait per brawler. Skin/variant portraits ("Portrait_Hyper_Colt") don't
 * match a brawler key and are simply never looked up. When a brawler has several,
 * the most square one wins — it loses the least of the face when cropped square.
 */
function buildPortraits(assets: FanKitAsset[]): Record<string, string> {
  const best = new Map<string, { squareness: number; url: string }>();
  for (const asset of assets) {
    const m = PORTRAIT_PATTERN.exec(asset.title.toLowerCase())?.groups;
    const name = m?.b ?? m?.b2;
    if (!name || !asset.width || !asset.height) continue;
    const key = brawlerKey(name);
    const squareness = Math.abs(Math.log(asset.width / asset.height));
    const prev = best.get(key);
    if (!prev || squareness < prev.squareness) best.set(key, { squareness, url: iconUrl(asset, 256) });
  }
  return Object.fromEntries([...best].map(([key, { url }]) => [key, url]));
}

const EMPTY: FanKitIcons = { gadgets: {}, starPowers: {}, hypercharges: {}, gears: {}, portraits: {} };

/**
 * Loads and indexes the fan kit icons (cached for a day). Never throws: if the
 * portal is unreachable, callers just fall back to the previous icon sources.
 */
export async function fetchFanKitIcons(): Promise<FanKitIcons> {
  try {
    const [gadgets, starPowers, hypercharges, gears, portraits] = await Promise.all(
      (["Gadgets", "Star Powers", "Hypercharge", "Gears", "Brawler Portraits"] as const).map(fetchAssets)
    );
    return {
      gadgets: buildSlots(gadgets, GADGET_PATTERNS, SWAPPED_GADGETS, NAMED_GADGET_SLOTS),
      starPowers: buildSlots(starPowers, STAR_POWER_PATTERNS, SWAPPED_STAR_POWERS),
      hypercharges: buildHypercharges(hypercharges),
      gears: Object.fromEntries(gears.map((g) => [g.title.toLowerCase(), iconUrl(g)])),
      portraits: buildPortraits(portraits),
    };
  } catch {
    return EMPTY;
  }
}

/** API gear name → fan kit asset. Brawler-specific (mythic) gears are looked up by brawler instead. */
const GEAR_TITLES: Record<string, string> = {
  SPEED: "gear_superrare_speed",
  HEALTH: "gear_superrare_heal",
  DAMAGE: "gear_superrare_damage",
  VISION: "gear_superrare_vision",
  SHIELD: "gear_superrare_shield",
  "RELOAD SPEED": "gear_epic_reload",
  "SUPER CHARGE": "gear_epic_super",
  "PET POWER": "gear_epic_pet",
  "GADGET COOLDOWN": "gear_gadget_cooldown",
  "GADGET CHARGE": "gear_plus_gadgets",
};

export function fanKitGearUrl(icons: FanKitIcons, gearName: string, brawlerName: string): string | undefined {
  const generic = GEAR_TITLES[gearName.toUpperCase()];
  if (generic) return icons.gears[generic];
  return icons.gears[`gear_mythic_${brawlerKey(brawlerName).toLowerCase()}`];
}
