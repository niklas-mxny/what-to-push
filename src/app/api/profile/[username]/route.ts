import { NextResponse } from "next/server";
import { normalizeUsername } from "@/lib/auth";
import { dbGet } from "@/lib/db";
import { loadPublicPlayer } from "@/lib/player-profile";
import { SupercellApiError } from "@/types/brawlstars";
import type { ProfileResponse, PublicPlayer } from "@/types/profile";

interface UserRow {
  username: string;
  player_tag: string | null;
  created_at: string;
}

export async function GET(_request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await dbGet<UserRow>("SELECT username, player_tag, created_at FROM users WHERE username_lower = ?", [
    normalizeUsername(username),
  ]);

  if (!user) {
    return NextResponse.json({ error: "No such profile.", code: "not_found" }, { status: 404 });
  }

  let player: PublicPlayer | null = null;
  let playerError: ProfileResponse["playerError"] = null;
  if (user.player_tag) {
    try {
      player = await loadPublicPlayer(user.player_tag);
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
  } satisfies ProfileResponse);
}
