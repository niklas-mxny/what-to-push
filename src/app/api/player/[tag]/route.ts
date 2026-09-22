import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { MissingApiTokenError } from "@/lib/env";
import { loadPublicPlayer } from "@/lib/player-profile";
import { SupercellApiError } from "@/types/brawlstars";
import type { PlayerResponse } from "@/types/profile";

/** Public profile for any Brawl Stars tag — no account on this site needed. */
export async function GET(_request: Request, { params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;

  try {
    const player = await loadPublicPlayer(decodeURIComponent(tag));
    const linked = getDb().prepare("SELECT username FROM users WHERE player_tag = ?").get(player.tag) as
      | { username: string }
      | undefined;
    return NextResponse.json({ player, linkedUsername: linked?.username ?? null } satisfies PlayerResponse);
  } catch (err) {
    if (err instanceof MissingApiTokenError) {
      return NextResponse.json({ error: err.message, code: "missing_token" }, { status: 500 });
    }
    if (err instanceof SupercellApiError) {
      return NextResponse.json({ error: err.message, code: err.reason }, { status: err.status });
    }
    return NextResponse.json({ error: "Unexpected error loading the player.", code: "generic" }, { status: 500 });
  }
}
