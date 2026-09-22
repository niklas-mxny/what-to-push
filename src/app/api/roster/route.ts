import { NextResponse } from "next/server";
import { fetchBrawlerMeta } from "@/lib/brawlapi";
import { MissingApiTokenError } from "@/lib/env";
import { buildRoster } from "@/lib/merge";
import { fetchOfficialBrawlers, fetchPlayer } from "@/lib/supercell";
import { SupercellApiError } from "@/types/brawlstars";

export async function GET(request: Request) {
  const tag = new URL(request.url).searchParams.get("tag");

  try {
    const [officialBrawlers, brawlApiMeta] = await Promise.all([
      fetchOfficialBrawlers(),
      fetchBrawlerMeta(),
    ]);

    let player = null;
    let playerError: { error: string; code?: string } | null = null;
    if (tag) {
      try {
        player = await fetchPlayer(tag);
      } catch (err) {
        if (err instanceof SupercellApiError) {
          playerError = { error: err.message, code: err.reason };
        } else {
          throw err;
        }
      }
    }

    const roster = buildRoster(officialBrawlers, brawlApiMeta, player);

    return NextResponse.json({
      roster,
      player: player ? { name: player.name, tag: player.tag, trophies: player.trophies } : null,
      playerError,
    });
  } catch (err) {
    if (err instanceof MissingApiTokenError) {
      return NextResponse.json({ error: err.message, code: "missing_token" }, { status: 500 });
    }
    if (err instanceof SupercellApiError) {
      return NextResponse.json({ error: err.message, code: err.reason }, { status: err.status });
    }
    return NextResponse.json(
      { error: "Unexpected error loading the brawlers.", code: "roster_generic" },
      { status: 500 }
    );
  }
}
