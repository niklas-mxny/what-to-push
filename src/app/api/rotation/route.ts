import { NextResponse } from "next/server";
import { findMapImageUrl } from "@/lib/brawlapi";
import { parseSupercellTimestamp } from "@/lib/date";
import { MissingApiTokenError } from "@/lib/env";
import { getModeInfo, normalizeModeKey } from "@/lib/mode-weights";
import { dedupeSlots } from "@/lib/rotation";
import { fetchRotation } from "@/lib/supercell";
import { SupercellApiError } from "@/types/brawlstars";
import type { ActiveSlot } from "@/types/domain";

export async function GET() {
  try {
    const rotation = await fetchRotation();

    const rawSlots: ActiveSlot[] = await Promise.all(
      rotation.map(async (r) => {
        const modeLabel = getModeInfo(r.event.mode).label;
        return {
          slotId: r.slotId,
          modeKey: normalizeModeKey(r.event.mode),
          modeLabel,
          mapName: r.event.map,
          mapImageUrl: await findMapImageUrl(r.event.id, r.event.map, modeLabel),
          endTime: parseSupercellTimestamp(r.endTime),
        };
      })
    );

    // Some rotation entries are already expired (or expiring within seconds) by
    // the time we read them — not worth recommending a brawler for a slot that's
    // effectively over.
    const now = Date.now();
    const liveSlots = rawSlots.filter((s) => new Date(s.endTime).getTime() > now);

    return NextResponse.json({ slots: dedupeSlots(liveSlots) });
  } catch (err) {
    if (err instanceof MissingApiTokenError) {
      return NextResponse.json({ error: err.message, code: "missing_token" }, { status: 500 });
    }
    if (err instanceof SupercellApiError) {
      return NextResponse.json({ error: err.message, code: err.reason }, { status: err.status });
    }
    return NextResponse.json(
      { error: "Unexpected error loading the rotation.", code: "rotation_generic" },
      { status: 500 }
    );
  }
}
