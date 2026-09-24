import "server-only";
import { parseSupercellTimestamp } from "@/lib/date";
import { dbAll, dbBatch, dbGet } from "@/lib/db";
import { fetchBattleLog, fetchPlayer, normalizePlayerTag } from "@/lib/supercell";
import { TROPHY_RANGE_MS, type TrophyHistory, type TrophyPoint, type TrophyRange } from "@/lib/trophy-activity";

/**
 * The Supercell API only knows a player's current trophies, so the history is
 * recorded here: a snapshot of the total whenever a player is looked at (and
 * daily for linked and saved players, see /api/cron/trophy-snapshots), plus the
 * total after each of the last 25 battles, walked back from the snapshot via
 * each battle's trophyChange — that gives hour-level detail without polling.
 */

/**
 * Don't ask the API about the same player more often than this. Below the
 * chart's 2-minute refresh, so every refresh of an open chart brings news;
 * however many people watch, it's at most two API calls per player a minute.
 */
const INGEST_INTERVAL_MS = 60 * 1000;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export async function recordTrophyHistory(rawTag: string, knownTrophies?: number): Promise<void> {
  const tag = normalizePlayerTag(rawTag);
  const now = Date.now();
  const [last, latest] = await Promise.all([
    dbGet<{ last_ingest: number }>("SELECT last_ingest FROM trophy_ingests WHERE player_tag = ?", [tag]),
    dbGet<{ at: number; trophies: number }>(
      "SELECT at, trophies FROM trophy_points WHERE player_tag = ? ORDER BY at DESC LIMIT 1",
      [tag]
    ),
  ]);
  if (last && now - Number(last.last_ingest) < INGEST_INTERVAL_MS) return;

  const [trophies, log] = await Promise.all([
    knownTrophies ?? fetchPlayer(tag).then((p) => p.trophies),
    // The battle log only adds detail; a snapshot alone is still worth keeping.
    fetchBattleLog(tag).catch(() => null),
  ]);

  const battles = (log?.items ?? [])
    .map((b) => ({ at: Date.parse(parseSupercellTimestamp(b.battleTime)), change: b.battle.trophyChange ?? 0 }))
    .filter((b) => Number.isFinite(b.at) && b.at < now)
    .sort((a, b) => b.at - a.at);
  // Nothing happened since the last stored point: the chart carries that
  // value forward to "now" anyway, so an identical snapshot every minute
  // would only bloat the table.
  const unchanged =
    latest !== undefined &&
    Number(latest.trophies) === trophies &&
    !battles.some((b) => b.at > Number(latest.at));
  const points: TrophyPoint[] = unchanged ? [] : [[now, trophies]];
  // Newest first: after a battle the player had `running`; before it, that
  // minus the battle's change.
  let running = trophies;
  for (const b of battles) {
    points.push([b.at, running]);
    running -= b.change;
  }
  if (battles.length > 0) points.push([battles[battles.length - 1].at - 1, running]);

  await dbBatch([
    ...points.map(([at, value]) => ({
      sql: "INSERT INTO trophy_points (player_tag, at, trophies) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
      args: [tag, at, value],
    })),
    {
      sql: `INSERT INTO trophy_ingests (player_tag, last_ingest) VALUES (?, ?)
            ON CONFLICT (player_tag) DO UPDATE SET last_ingest = excluded.last_ingest`,
      args: [tag, now],
    },
  ]);
}

/** Keeps the last point per bucket — enough for daily samples, and a small response. */
function lastPerBucket(points: TrophyPoint[], bucketMs: number): TrophyPoint[] {
  const out: TrophyPoint[] = [];
  for (const p of points) {
    const prev = out[out.length - 1];
    if (prev && Math.floor(prev[0] / bucketMs) === Math.floor(p[0] / bucketMs)) out[out.length - 1] = p;
    else out.push(p);
  }
  return out;
}

export async function loadTrophyHistory(rawTag: string, range: TrophyRange): Promise<TrophyHistory> {
  const tag = normalizePlayerTag(rawTag);
  const now = Date.now();
  // A day of margin, so the client can align the first sample to local midnight.
  const from = now - TROPHY_RANGE_MS[range] - DAY;

  const [baseline, rows, first] = await Promise.all([
    dbGet<{ at: number; trophies: number }>(
      "SELECT at, trophies FROM trophy_points WHERE player_tag = ? AND at < ? ORDER BY at DESC LIMIT 1",
      [tag, from]
    ),
    dbAll<{ at: number; trophies: number }>(
      "SELECT at, trophies FROM trophy_points WHERE player_tag = ? AND at >= ? ORDER BY at",
      [tag, from]
    ),
    dbGet<{ since: number | null }>("SELECT MIN(at) AS since FROM trophy_points WHERE player_tag = ?", [tag]),
  ]);

  let points: TrophyPoint[] = [...(baseline ? [baseline] : []), ...rows].map((r) => [
    Number(r.at),
    Number(r.trophies),
  ]);
  if (range === "1m" || range === "1y") points = lastPerBucket(points, HOUR);

  return { now, since: first?.since == null ? null : Number(first.since), points };
}
