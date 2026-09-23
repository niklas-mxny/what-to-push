import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { playerIconUrl } from "@/lib/brawlapi";
import { dbAll, dbRun } from "@/lib/db";
import { fetchPlayer, normalizePlayerTag } from "@/lib/supercell";
import { SupercellApiError } from "@/types/brawlstars";
import type { Favorite } from "@/types/profile";

interface FavoriteRow {
  player_tag: string;
  player_name: string;
  icon_url: string;
}

const notSignedIn = () =>
  NextResponse.json({ error: "Not signed in.", code: "not_authenticated" }, { status: 401 });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return notSignedIn();

  const rows = await dbAll<FavoriteRow>(
    "SELECT player_tag, player_name, icon_url FROM favorites WHERE user_id = ? ORDER BY player_name COLLATE NOCASE",
    [user.id]
  );

  const favorites: Favorite[] = rows.map((r) => ({ tag: r.player_tag, name: r.player_name, iconUrl: r.icon_url }));
  return NextResponse.json({ favorites });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return notSignedIn();

  const body = await request.json().catch(() => null);
  const tag = normalizePlayerTag(typeof body?.tag === "string" ? body.tag : "");
  if (!tag) {
    return NextResponse.json({ error: "Player tag is required.", code: "invalid_tag" }, { status: 400 });
  }

  // Looked up server-side (not trusted from the client) so the stored name and
  // icon are real, and so nobody can save a tag that doesn't exist.
  let favorite: Favorite;
  try {
    const player = await fetchPlayer(tag);
    favorite = { tag: normalizePlayerTag(player.tag), name: player.name, iconUrl: playerIconUrl(player.icon.id) };
  } catch (err) {
    if (err instanceof SupercellApiError) {
      return NextResponse.json({ error: err.message, code: err.reason }, { status: err.status });
    }
    throw err;
  }

  await dbRun(
    `INSERT INTO favorites (user_id, player_tag, player_name, icon_url) VALUES (?, ?, ?, ?)
     ON CONFLICT (user_id, player_tag) DO UPDATE SET player_name = excluded.player_name, icon_url = excluded.icon_url`,
    [user.id, favorite.tag, favorite.name, favorite.iconUrl]
  );

  return NextResponse.json({ favorite });
}
