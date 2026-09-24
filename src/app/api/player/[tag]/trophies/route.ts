import { NextResponse } from "next/server";
import { MissingApiTokenError } from "@/lib/env";
import { isTrophyRange } from "@/lib/trophy-activity";
import { loadTrophyHistory, recordTrophyHistory } from "@/lib/trophy-history";
import { SupercellApiError } from "@/types/brawlstars";

/** Recorded trophy history of any player, for the activity chart. Records a fresh snapshot first (throttled). */
export async function GET(request: Request, { params }: { params: Promise<{ tag: string }> }) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const range = new URL(request.url).searchParams.get("range");
  if (!isTrophyRange(range)) {
    return NextResponse.json({ error: "Unknown range.", code: "generic" }, { status: 400 });
  }

  try {
    await recordTrophyHistory(tag);
  } catch (err) {
    if (err instanceof SupercellApiError && err.status === 404) {
      return NextResponse.json({ error: err.message, code: err.reason }, { status: 404 });
    }
    // API down or no token: the history recorded so far is still worth showing.
    if (!(err instanceof SupercellApiError || err instanceof MissingApiTokenError)) throw err;
  }

  return NextResponse.json(await loadTrophyHistory(tag, range));
}
