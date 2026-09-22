import { NextResponse } from "next/server";
import { findMapImageUrl } from "@/lib/brawlapi";
import { parseSupercellTimestamp } from "@/lib/date";
import { MissingApiTokenError } from "@/lib/env";
import { fetchRotation } from "@/lib/supercell";
import { SupercellApiError } from "@/types/brawlstars";
import { getModeInfo } from "@/lib/mode-weights";
import type { ActiveSlot } from "@/types/domain";

export async function GET() {
  try {
    const rotation = await fetchRotation();

    const slots: ActiveSlot[] = await Promise.all(
      rotation.map(async (r) => ({
        slotId: r.slotId,
        modeKey: r.event.mode,
        modeLabel: getModeInfo(r.event.mode).label,
        mapName: r.event.map,
        mapImageUrl: await findMapImageUrl(r.event.map),
        endTime: parseSupercellTimestamp(r.endTime),
      }))
    );

    return NextResponse.json({ slots });
  } catch (err) {
    if (err instanceof MissingApiTokenError) {
      return NextResponse.json({ error: err.message, code: "missing_token" }, { status: 500 });
    }
    if (err instanceof SupercellApiError) {
      return NextResponse.json({ error: err.message, code: err.reason }, { status: err.status });
    }
    return NextResponse.json({ error: "Unerwarteter Fehler beim Laden der Rotation." }, { status: 500 });
  }
}
