import "server-only";
import { getApiToken } from "@/lib/env";
import { normalizePlayerTag } from "@/lib/tag";
import {
  SupercellApiError,
  type Club,
  type EventRotation,
  type Player,
  type SupercellBrawlerList,
} from "@/types/brawlstars";

export { normalizePlayerTag };

// Supercell keys only work from the IP addresses they were created for. Hosts
// without a fixed outgoing IP (Vercel) go through the RoyaleAPI proxy instead:
// BRAWL_STARS_API_BASE_URL=https://bsproxy.royaleapi.dev/v1 with a key created
// for 45.79.218.79.
const BASE_URL = process.env.BRAWL_STARS_API_BASE_URL || "https://api.brawlstars.com/v1";

/**
 * `revalidateSeconds` opts a request into Next's data cache. Only use it for
 * slow-changing data: time-based revalidation is stale-while-revalidate, so the
 * first request after a long gap (e.g. a dev-server restart the next day) gets
 * the *old* response — for the rotation that meant yesterday's already-ended
 * slots, which were then filtered out, leaving just two modes on the dashboard.
 * Live data (rotation, players, clubs) is therefore always fetched fresh.
 */
async function scFetch<T>(path: string, revalidateSeconds?: number): Promise<T> {
  const token = getApiToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    ...(revalidateSeconds ? { next: { revalidate: revalidateSeconds } } : { cache: "no-store" as const }),
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

export function fetchClub(tag: string): Promise<Club> {
  return scFetch<Club>(`/clubs/%23${normalizePlayerTag(tag)}`);
}

export function fetchRotation(): Promise<EventRotation> {
  return scFetch<EventRotation>(`/events/rotation`);
}

export function fetchOfficialBrawlers(): Promise<SupercellBrawlerList> {
  // The brawler list only changes when a new brawler is released.
  return scFetch<SupercellBrawlerList>(`/brawlers`, 3600);
}
