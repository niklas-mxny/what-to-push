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

let mapCandidatesByName: Map<string, MapCandidate[]> | null = null;

async function loadMapCandidates(): Promise<Map<string, MapCandidate[]>> {
  if (mapCandidatesByName) return mapCandidatesByName;

  const res = await fetch(`${BASE_URL}/maps`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });
  const map = new Map<string, MapCandidate[]>();
  if (res.ok) {
    const data = (await res.json()) as BrawlApiMapList;
    for (const m of data.list) {
      const key = m.name.trim().toUpperCase();
      const list = map.get(key) ?? [];
      list.push({ modeName: m.gameMode?.name, disabled: m.disabled, imageUrl: m.imageUrl });
      map.set(key, list);
    }
  }
  mapCandidatesByName = map;
  return map;
}

/** Our merged "Showdown" mode label can match any of these BrawlAPI mode names. */
const SHOWDOWN_MODE_NAMES = ["Solo Showdown", "Duo Showdown", "Trio Showdown"];

/**
 * Bildet (Map-Name, Modus) auf ein Vorschaubild ab (nur fürs UI — die offizielle
 * Rotation liefert selbst keine Bild-URL). Bevorzugt einen aktiven (nicht
 * deaktivierten) Eintrag, dessen Modus zum aktuellen Rotations-Slot passt; fällt
 * andernfalls auf einen aktiven Eintrag mit anderem Modus zurück, statt gar kein
 * Bild zu zeigen.
 */
/**
 * Ranked tier icon. Not part of any documented API/CDN field — reverse-engineered
 * by probing brawlify.com's own rank badge images: rankedRank 4 ("Silver I") is
 * served at id 58000003, and valid ids run from 58000000 to 58000021 (22 tiers),
 * so the offset is consistently `rank - 1`.
 */
export function rankIconUrl(rankedRank: number): string {
  return `https://brawlify.com/images/ranked/${58000000 + (rankedRank - 1)}.png`;
}

/** The player's own profile icon (distinct from any brawler icon). */
export function playerIconUrl(iconId: number): string {
  return `https://cdn.brawlify.com/profile-icons/regular/${iconId}.png`;
}

export async function findMapImageUrl(mapName: string, modeLabel: string): Promise<string | undefined> {
  const candidates = (await loadMapCandidates()).get(mapName.trim().toUpperCase());
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
