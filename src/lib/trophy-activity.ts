/**
 * Time ranges and the gain curve for the trophy activity chart. Client-safe:
 * the server only stores and returns points; bucketing happens in the viewer's
 * own timezone here.
 */

export const TROPHY_RANGES = ["1d", "1w", "1m", "1y"] as const;
export type TrophyRange = (typeof TROPHY_RANGES)[number];

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const TROPHY_RANGE_MS: Record<TrophyRange, number> = {
  "1d": DAY,
  "1w": 7 * DAY,
  "1m": 30 * DAY,
  "1y": 365 * DAY,
};

export function isTrophyRange(value: unknown): value is TrophyRange {
  return typeof value === "string" && (TROPHY_RANGES as readonly string[]).includes(value);
}

/** [Unix ms, total trophies], oldest first. */
export type TrophyPoint = [number, number];

export interface TrophyHistory {
  /** Server time the history was read at. */
  now: number;
  /** Earliest point recorded for this player at all (null: nothing yet). */
  since: number | null;
  /** Points in the range, plus the last one before it as the baseline. */
  points: TrophyPoint[];
}

export interface GainSample {
  t: number;
  /** Trophies gained since the start of the range; null before recording began. */
  gain: number | null;
}

/** Sample times: local hour / 3-hour / midnight boundaries, then "now". */
function sampleTimes(range: TrophyRange, now: number): number[] {
  const start = now - TROPHY_RANGE_MS[range];
  const d = new Date(now);
  const daily = range === "1m" || range === "1y";
  const stepHours = range === "1w" ? 3 : 1;
  if (daily) d.setHours(0, 0, 0, 0);
  else d.setHours(d.getHours() - (d.getHours() % stepHours), 0, 0, 0);

  const times: number[] = [];
  // Local calendar arithmetic (not fixed ms), so days stay days across DST.
  while (d.getTime() > start) {
    times.push(d.getTime());
    if (daily) d.setDate(d.getDate() - 1);
    else d.setHours(d.getHours() - stepHours);
  }
  times.push(Math.max(d.getTime(), start));
  times.reverse();
  if (times[times.length - 1] < now) times.push(now);
  return times;
}

/** Trophies at time t: the last point at or before it (null before the first). */
function valueAt(points: TrophyPoint[], t: number): number | null {
  let lo = 0;
  let hi = points.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (points[mid][0] <= t) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found === -1 ? null : points[found][1];
}

/**
 * Cumulative trophy gain over the range. The baseline is the total at the
 * range's start; if recording began inside the range, it's the first recorded
 * total, and the curve starts there (at 0) instead of inventing earlier data.
 */
export function gainCurve(history: TrophyHistory, range: TrophyRange): GainSample[] {
  const { points, now } = history;
  if (points.length === 0) return [];
  const times = sampleTimes(range, now);

  const startValue = valueAt(points, times[0]);
  if (startValue !== null) {
    return times.map((t) => ({ t, gain: valueAt(points, t)! - startValue }));
  }

  const [firstAt, firstValue] = points[0];
  if (firstAt > now) return [];
  const samples: GainSample[] = times
    .filter((t) => t < firstAt)
    .map((t) => ({ t, gain: null }));
  samples.push({ t: firstAt, gain: 0 });
  for (const t of times) {
    if (t > firstAt) samples.push({ t, gain: valueAt(points, t)! - firstValue });
  }
  return samples;
}

/** The gain at the end of the curve (null: no data in the range). */
export function totalGain(samples: GainSample[]): number | null {
  const last = samples[samples.length - 1];
  return last ? last.gain : null;
}
