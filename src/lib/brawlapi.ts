import "server-only";
import type { BrawlApiBrawlerList } from "@/types/brawlapi";

const BASE_URL = "https://api.brawlapi.com/v1";

interface BrawlApiMap {
  id: number;
  name: string;
  imageUrl: string;
  disabled: boolean;
  gameMode?: { name: string };
}

interface BrawlApiMapList {
  list: BrawlApiMap[];
}

/**
 * BrawlAPI liefert keine Live-Event-Rotation (das Feld ist laut eigener Doku immer leer)
 * und ihr "class"-Feld ist mittlerweile ein einzigartiger Flavor-Text pro Brawler statt
 * einer echten Rollen-Kategorie — wir nutzen sie deshalb nur für Icons/Seltenheit.
 * Kein API-Key nötig, daher unkritisch gecacht (Metadaten ändern sich selten).
 */
export async function fetchBrawlerMeta(): Promise<BrawlApiBrawlerList> {
  const res = await fetch(`${BASE_URL}/brawlers`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    throw new Error(`BrawlAPI Fehler: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<BrawlApiBrawlerList>;
}

// Map names are reused across many different modes/seasons/variants (e.g. "Cavern
// Churn" exists for Solo/Duo/Trio Showdown, Drum Roll, Loaded Showdown, ... plus
// disabled duplicates) — grouping by name alone (the old approach) could easily
// pick an image from the wrong mode. Group by name, keep every (mode, disabled,
// imageUrl) candidate, and pick the best match at lookup time instead.
interface MapCandidate {
  modeName: string | undefined;
  disabled: boolean;
  imageUrl: string;
}

interface MapIndex {
  byId: Map<number, string>;
  byName: Map<string, MapCandidate[]>;
}

/**
 * BrawlAPI drops punctuation from names ("Belles Rock", "Brawlers Rift") while
 * the official rotation keeps it ("Belle's Rock"), so names are compared
 * without anything but letters and digits.
 */
function mapNameKey(name: string): string {
  return name.toUpperCase().replace(/[^\p{L}\p{N}]/gu, "");
}

let mapIndex: MapIndex | null = null;

async function loadMapIndex(): Promise<MapIndex> {
  if (mapIndex) return mapIndex;

  const res = await fetch(`${BASE_URL}/maps`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });
  const index: MapIndex = { byId: new Map(), byName: new Map() };
  if (res.ok) {
    const data = (await res.json()) as BrawlApiMapList;
    for (const m of data.list) {
      index.byId.set(m.id, m.imageUrl);
      const key = mapNameKey(m.name);
      const list = index.byName.get(key) ?? [];
      list.push({ modeName: m.gameMode?.name, disabled: m.disabled, imageUrl: m.imageUrl });
      index.byName.set(key, list);
    }
    // Only cache a successful load; a failed one is retried on the next request.
    mapIndex = index;
  }
  return index;
}

/** Our merged "Showdown" mode label can match any of these BrawlAPI mode names. */
const SHOWDOWN_MODE_NAMES = ["Solo Showdown", "Duo Showdown", "Trio Showdown"];

/** Club badge by the API's badgeId (not part of the fan kit, which only has a few generic badges). */
export function clubBadgeUrl(badgeId: number): string {
  return `https://cdn.brawlify.com/club-badges/regular/${badgeId}.png`;
}

/**
 * Official in-game hypercharge badge (the purple flame), extracted from the game
 * files and served by Brawlify per hypercharge ID. Used instead of the fan kit,
 * which only has the badge for about two thirds of the brawlers.
 */
export function hyperchargeIconUrl(hyperchargeId: number): string {
  return `https://brawlify.com/images/hypercharges/${hyperchargeId}.png`;
}

/** The player's own profile icon (distinct from any brawler icon). */
export function playerIconUrl(iconId: number): string {
  return `https://cdn.brawlify.com/profile-icons/regular/${iconId}.png`;
}

/**
 * Preview image for a rotation slot (the official rotation has no image URL).
 * The rotation's event ID is the map's ID on BrawlAPI, so that's an exact
 * match — including which of several same-named variants is meant. Falls back
 * to the name for maps BrawlAPI lists under a different ID, preferring an
 * active entry whose mode matches the slot.
 */
export async function findMapImageUrl(
  mapId: number,
  mapName: string,
  modeLabel: string
): Promise<string | undefined> {
  const index = await loadMapIndex();
  const exact = index.byId.get(mapId);
  if (exact) return exact;

  const candidates = index.byName.get(mapNameKey(mapName));
  if (!candidates || candidates.length === 0) return undefined;

  const modeMatches = (candidateMode: string | undefined) => {
    if (!candidateMode) return false;
    if (modeLabel === "Showdown") return SHOWDOWN_MODE_NAMES.includes(candidateMode);
    return candidateMode === modeLabel;
  };

  return (
    candidates.find((c) => !c.disabled && modeMatches(c.modeName))?.imageUrl ??
    candidates.find((c) => !c.disabled)?.imageUrl ??
    candidates.find((c) => modeMatches(c.modeName))?.imageUrl ??
    candidates[0].imageUrl
  );
}
