import { NextResponse } from "next/server";
import { dbAll } from "@/lib/db";
import { recordTrophyHistory } from "@/lib/trophy-history";

/**
 * Daily trophy snapshot (vercel.json → crons) for every player someone here
 * cares about: tags linked to an account and saved favorites. Players that are
 * only looked up get snapshots when viewed. Vercel sends CRON_SECRET as a
 * bearer token; without it set, the route refuses to run.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const rows = await dbAll<{ tag: string }>(
    "SELECT player_tag AS tag FROM users WHERE player_tag IS NOT NULL UNION SELECT player_tag FROM favorites"
  );
  const tags = rows.map((r) => r.tag);

  // A few at a time, to stay well inside the API's rate limit.
  let failed = 0;
  for (let i = 0; i < tags.length; i += 5) {
    const results = await Promise.allSettled(tags.slice(i, i + 5).map((tag) => recordTrophyHistory(tag)));
    failed += results.filter((r) => r.status === "rejected").length;
  }

  return NextResponse.json({ players: tags.length, failed });
}
