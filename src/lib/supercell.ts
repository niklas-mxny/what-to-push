import "server-only";
import { getApiToken } from "@/lib/env";
import { normalizePlayerTag } from "@/lib/tag";
import {
  SupercellApiError,
  type EventRotation,
  type Player,
  type SupercellBrawlerList,
} from "@/types/brawlstars";

export { normalizePlayerTag };

const BASE_URL = "https://api.brawlstars.com/v1";

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
        "This server IP isn't whitelisted for the Supercell API key yet.",
        403,
        "invalid_ip"
      );
    }
    if (res.status === 404) {
      throw new SupercellApiError("Not found — check the player tag.", 404, "not_found");
    }
    throw new SupercellApiError(message || "Supercell API error", res.status, "generic");
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
