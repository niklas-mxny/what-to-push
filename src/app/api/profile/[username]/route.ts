import { NextResponse } from "next/server";
import { normalizeUsername } from "@/lib/auth";
import { playerIconUrl, rankIconUrl } from "@/lib/brawlapi";
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
        iconUrl: playerIconUrl(p.icon.id),
        trophies: p.trophies,
        totalPrestigeLevel: p.totalPrestigeLevel,
        victories3v3: p["3vs3Victories"],
        soloVictories: p.soloVictories,
        duoVictories: p.duoVictories,
        clubName: "name" in p.club ? p.club.name : null,
        brawlersOwned: p.brawlers.length,
        fame:
          p.fame && p.fameTierName
            ? { value: p.fame, tierName: p.fameTierName }
            : null,
        rankedCurrent:
          p.rankedRank && p.rankedRankName
            ? { rankName: p.rankedRankName, elo: p.rankedElo ?? null, iconUrl: rankIconUrl(p.rankedRank) }
            : null,
        rankedHighest:
          p.highestAllTimeRankedRank && p.highestAllTimeRankedRankName
            ? {
                rankName: p.highestAllTimeRankedRankName,
                elo: p.highestAllTimeRankedElo ?? null,
                iconUrl: rankIconUrl(p.highestAllTimeRankedRank),
              }
            : null,
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
