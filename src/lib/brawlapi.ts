import "server-only";
import type { BrawlApiBrawlerList } from "@/types/brawlapi";

const BASE_URL = "https://api.brawlapi.com/v1";

interface BrawlApiMap {
  id: number;
  name: string;
  imageUrl: string;
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

let mapImageCache: Map<string, string> | null = null;

/**
 * Bildet Map-Namen auf ein Vorschaubild ab (nur fürs UI — die offizielle Rotation
 * liefert selbst keine Bild-URL, nur den Map-Namen als String). Liste enthält auch
 * historische/deaktivierte Maps; bei Namensdopplungen gewinnt der erste Treffer.
 */
export async function findMapImageUrl(mapName: string): Promise<string | undefined> {
  if (!mapImageCache) {
    const res = await fetch(`${BASE_URL}/maps`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      mapImageCache = new Map();
    } else {
      const data = (await res.json()) as BrawlApiMapList;
      mapImageCache = new Map();
      for (const map of data.list) {
        const key = map.name.trim().toUpperCase();
        if (!mapImageCache.has(key)) {
          mapImageCache.set(key, map.imageUrl);
        }
      }
    }
  }
  return mapImageCache.get(mapName.trim().toUpperCase());
}
