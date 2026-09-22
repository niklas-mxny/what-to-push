import { NextResponse } from "next/server";
import { playerIconUrl } from "@/lib/brawlapi";
import { getDb } from "@/lib/db";
import { fetchPlayer, normalizePlayerTag } from "@/lib/supercell";

interface UserRow {
  username: string;
  player_tag: string | null;
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ users: [], tagMatch: null });
  }

  const db = getDb();
  const users = db
    .prepare(
      "SELECT username, player_tag FROM users WHERE username_lower LIKE ? ORDER BY username COLLATE NOCASE LIMIT 20"
    )
    .all(`%${q.toLowerCase()}%`) as unknown as UserRow[];

  // Also try the query as a direct player tag lookup (e.g. "#2Y8VQGCCV") — this
  // works for any valid Brawl Stars tag, not just ones linked to an account here.
  let tagMatch: {
    tag: string;
    name: string;
    iconUrl: string;
    trophies: number;
    linkedUsername: string | null;
  } | null = null;
  const normalizedTag = normalizePlayerTag(q);
  if (normalizedTag.length >= 3) {
    try {
      const player = await fetchPlayer(normalizedTag);
      // player_tag is stored without the leading '#' (see normalizePlayerTag), but
      // the Supercell API always returns player.tag with it — strip it to match.
      const linked = db
        .prepare("SELECT username FROM users WHERE player_tag = ?")
        .get(normalizePlayerTag(player.tag)) as { username: string } | undefined;
      tagMatch = {
        tag: normalizePlayerTag(player.tag),
        name: player.name,
        iconUrl: playerIconUrl(player.icon.id),
        trophies: player.trophies,
        linkedUsername: linked?.username ?? null,
      };
    } catch {
      // Not a valid/existing tag — fine, just means no tag match.
    }
  }

  return NextResponse.json({
    users: users.map((u) => ({ username: u.username, playerTag: u.player_tag })),
    tagMatch,
  });
}
