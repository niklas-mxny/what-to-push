import { NextResponse } from "next/server";
import { clubBadgeUrl, playerIconUrl } from "@/lib/brawlapi";
import { dbAll, dbGet } from "@/lib/db";
import { fetchClub, fetchPlayer, normalizePlayerTag } from "@/lib/supercell";

interface UserRow {
  username: string;
  player_tag: string | null;
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ users: [], tagMatch: null, clubMatch: null });
  }

  const users = await dbAll<UserRow>(
    "SELECT username, player_tag FROM users WHERE username_lower LIKE ? ORDER BY username COLLATE NOCASE LIMIT 20",
    [`%${q.toLowerCase()}%`]
  );

  // Also try the query as a direct player tag and club tag lookup (e.g.
  // "#2Y8VQGCCV") — works for any Brawl Stars tag, not just ones linked to an
  // account here. Player and club tags are separate namespaces, so try both.
  let tagMatch: {
    tag: string;
    name: string;
    iconUrl: string;
    trophies: number;
    linkedUsername: string | null;
  } | null = null;
  let clubMatch: { tag: string; name: string; badgeUrl: string; trophies: number; memberCount: number } | null = null;
  const normalizedTag = normalizePlayerTag(q);
  if (normalizedTag.length >= 3) {
    // A rejection just means "no such tag" for that namespace.
    const [player, club] = await Promise.all([
      fetchPlayer(normalizedTag).catch(() => null),
      fetchClub(normalizedTag).catch(() => null),
    ]);
    if (player) {
      // player_tag is stored without the leading '#' (see normalizePlayerTag), but
      // the Supercell API always returns player.tag with it — strip it to match.
      const linked = await dbGet<{ username: string }>("SELECT username FROM users WHERE player_tag = ?", [
        normalizePlayerTag(player.tag),
      ]);
      tagMatch = {
        tag: normalizePlayerTag(player.tag),
        name: player.name,
        iconUrl: playerIconUrl(player.icon.id),
        trophies: player.trophies,
        linkedUsername: linked?.username ?? null,
      };
    }
    if (club) {
      clubMatch = {
        tag: normalizePlayerTag(club.tag),
        name: club.name,
        badgeUrl: clubBadgeUrl(club.badgeId),
        trophies: club.trophies,
        memberCount: club.members.length,
      };
    }
  }

  return NextResponse.json({
    users: users.map((u) => ({ username: u.username, playerTag: u.player_tag })),
    tagMatch,
    clubMatch,
  });
}
