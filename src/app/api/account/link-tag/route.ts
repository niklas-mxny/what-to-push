import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, getUserBySession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { fetchPlayer, normalizePlayerTag } from "@/lib/supercell";
import { SupercellApiError } from "@/types/brawlstars";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const user = getUserBySession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json({ error: "Not signed in.", code: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const rawTag = typeof body?.tag === "string" ? body.tag : "";
  const tag = normalizePlayerTag(rawTag);
  if (!tag) {
    return NextResponse.json({ error: "Player tag is required.", code: "invalid_tag" }, { status: 400 });
  }

  try {
    // Confirms the tag actually exists before linking it — no ownership
    // verification is possible (Supercell doesn't offer player-side OAuth),
    // so this is a self-declared link, same as any other fan site.
    await fetchPlayer(tag);
  } catch (err) {
    if (err instanceof SupercellApiError) {
      return NextResponse.json({ error: err.message, code: err.reason }, { status: err.status });
    }
    throw err;
  }

  getDb().prepare("UPDATE users SET player_tag = ? WHERE id = ?").run(tag, user.id);
  return NextResponse.json({ username: user.username, playerTag: tag });
}
