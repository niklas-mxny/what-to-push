import "server-only";
import { getApiToken } from "@/lib/env";
import {
  SupercellApiError,
  type EventRotation,
  type Player,
  type SupercellBrawlerList,
} from "@/types/brawlstars";

const BASE_URL = "https://api.brawlstars.com/v1";

/**
 * Normalizes a player tag: accepts with/without leading '#', trims whitespace,
 * uppercases, and encodes for use in a URL path segment.
 */
export function normalizePlayerTag(rawTag: string): string {
  const withoutHash = rawTag.trim().toUpperCase().replace(/^#/, "");
  return withoutHash;
}

async function scFetch<T>(path: string): Promise<T> {
  const token = getApiToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    // Rotation and player data change frequently; keep requests fresh but avoid
    // hammering the API on every render.
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    let reason: string | undefined;
    let message = res.statusText;
    try {
      const body = (await res.json()) as { reason?: string; message?: string };
      reason = body.reason;
      message = body.message ?? message;
    } catch {
      // body wasn't JSON — ignore, use statusText
    }

    if (res.status === 403 && reason === "accessDenied.invalidIp") {
      throw new SupercellApiError(
        "Diese Server-IP ist beim Supercell API Key nicht freigegeben. Füge sie unter developer.brawlstars.com bei deinem Key hinzu.",
        403,
        reason
      );
    }
    if (res.status === 404) {
      throw new SupercellApiError("Nicht gefunden — prüfe den Spieler-Tag.", 404, reason);
    }
    throw new SupercellApiError(message || "Supercell API Fehler", res.status, reason);
  }

  return res.json() as Promise<T>;
}

export function fetchPlayer(tag: string): Promise<Player> {
  const normalized = normalizePlayerTag(tag);
  return scFetch<Player>(`/players/%23${normalized}`);
}

export function fetchRotation(): Promise<EventRotation> {
  return scFetch<EventRotation>(`/events/rotation`);
}

export function fetchOfficialBrawlers(): Promise<SupercellBrawlerList> {
  return scFetch<SupercellBrawlerList>(`/brawlers`);
}
