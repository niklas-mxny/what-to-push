import { NextResponse } from "next/server";
import { MissingApiTokenError } from "@/lib/env";
import { loadPublicClub } from "@/lib/player-profile";
import { SupercellApiError } from "@/types/brawlstars";

/** A club with its member list, by club tag. */
export async function GET(_request: Request, { params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;

  try {
    const club = await loadPublicClub(decodeURIComponent(tag));
    return NextResponse.json({ club });
  } catch (err) {
    if (err instanceof MissingApiTokenError) {
      return NextResponse.json({ error: err.message, code: "missing_token" }, { status: 500 });
    }
    if (err instanceof SupercellApiError) {
      return NextResponse.json({ error: err.message, code: err.reason }, { status: err.status });
    }
    return NextResponse.json({ error: "Unexpected error loading the club.", code: "generic" }, { status: 500 });
  }
}
