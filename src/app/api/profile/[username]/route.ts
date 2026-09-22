import { NextResponse } from "next/server";
import { normalizeUsername } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { fetchPlayer } from "@/lib/supercell";
import { SupercellApiError } from "@/types/brawlstars";

interface UserRow {
  username: string;
  player_tag: string | null;
  created_at: string;
}

export async function GET(_request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = getDb()
    .prepare("SELECT username, player_tag, created_at FROM users WHERE username_lower = ?")
    .get(normalizeUsername(username)) as unknown as UserRow | undefined;

  if (!user) {
    return NextResponse.json({ error: "No such profile.", code: "not_found" }, { status: 404 });
  }

  let player = null;
  let playerError = null;
  if (user.player_tag) {
    try {
      const p = await fetchPlayer(user.player_tag);
      player = {
        name: p.name,
        tag: p.tag,
        trophies: p.trophies,
        highestTrophies: p.highestTrophies,
        totalPrestigeLevel: p.totalPrestigeLevel,
        expLevel: p.expLevel,
        victories3v3: p["3vs3Victories"],
        soloVictories: p.soloVictories,
        duoVictories: p.duoVictories,
        clubName: "name" in p.club ? p.club.name : null,
        brawlersOwned: p.brawlers.length,
      };
    } catch (err) {
      playerError = err instanceof SupercellApiError ? { error: err.message, code: err.reason } : { error: "Unexpected error." };
    }
  }

  return NextResponse.json({
    username: user.username,
    playerTag: user.player_tag,
    memberSince: user.created_at,
    player,
    playerError,
  });
}
