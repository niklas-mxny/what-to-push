"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import type { GainSample, TrophyRange } from "@/lib/trophy-activity";

export interface GainSeries {
  id: string;
  label: string;
  /** CSS color (a --chart-* token). */
  color: string;
  samples: GainSample[];
}

const PLOT_H = 180;
const PAD_TOP = 10;
const AXIS_H = 26;
const Y_AXIS_W = 52;
const PAD_RIGHT = 10;
const HEIGHT = PAD_TOP + PLOT_H + AXIS_H;

export function formatGain(value: number, locale: string): string {
  const abs = Math.abs(value).toLocaleString(locale);
  return value > 0 ? `+${abs}` : value < 0 ? `−${abs}` : "0";
}

/** 1-2-5 steps: 0 / 250 / 500 / 750, never 0 / 237 / 474. */
function niceTicks(lo: number, hi: number, target = 4): number[] {
  const span = hi - lo || 1;
  const raw = span / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const ticks: number[] = [];
  for (let v = Math.floor(lo / step) * step; v <= Math.ceil(hi / step) * step + step / 2; v += step) {
    ticks.push(Math.round(v));
  }
  return ticks;
}

/** Candidate x ticks at calendar boundaries in the viewer's timezone. */
function timeTicks(range: TrophyRange, from: number, to: number): number[] {
  const d = new Date(from);
  const ticks: number[] = [];
  if (range === "1d") {
    d.setHours(Math.ceil(d.getHours() / 6) * 6, 0, 0, 0);
    for (; d.getTime() <= to; d.setHours(d.getHours() + 6)) if (d.getTime() >= from) ticks.push(d.getTime());
  } else if (range === "1y") {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    for (d.setMonth(d.getMonth() + 1); d.getTime() <= to; d.setMonth(d.getMonth() + 1)) ticks.push(d.getTime());
  } else {
    d.setHours(0, 0, 0, 0);
    for (d.setDate(d.getDate() + 1); d.getTime() <= to; d.setDate(d.getDate() + 1)) ticks.push(d.getTime());
  }
  return ticks;
}

function tickLabel(range: TrophyRange, t: number, locale: string): string {
  const d = new Date(t);
  if (range === "1d") return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  if (range === "1w") return d.toLocaleDateString(locale, { weekday: "short" });
  if (range === "1m") return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
  return d.toLocaleDateString(locale, { month: "short" });
}

function tooltipLabel(range: TrophyRange, t: number, locale: string): string {
  const d = new Date(t);
  if (range === "1d" || range === "1w") {
    return d.toLocaleString(locale, { weekday: "short", hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: range === "1y" ? "numeric" : undefined });
}

/** The sample at or right before t (the curve is a running total, so "so far"). */
function sampleAt(samples: GainSample[], t: number): GainSample | undefined {
  let found: GainSample | undefined;
  for (const s of samples) {
    if (s.t <= t) found = s;
    else break;
  }
  return found;
}

/**
 * Cumulative trophy gain over time, one line per player. Hover, touch or the
 * arrow keys move a crosshair that reads out every series at that time.
 */
export function TrophyGainChart({
  series,
  range,
  locale,
  label,
  emptyLabel,
}: {
  series: GainSeries[];
  range: TrophyRange;
  locale: string;
  label: string;
  emptyLabel: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The first series with data sets the time grid the crosshair snaps to.
  const master = series.find((s) => s.samples.length > 0)?.samples ?? [];
  const allTimes = series.flatMap((s) => s.samples.map((p) => p.t));
  const gains = series.flatMap((s) => s.samples.flatMap((p) => (p.gain === null ? [] : [p.gain])));
  const hasData = gains.length > 0;

  const plotW = Math.max(0, width - Y_AXIS_W - PAD_RIGHT);
  const tMin = Math.min(...allTimes);
  const tMax = Math.max(...allTimes);
  const ticks = niceTicks(Math.min(0, ...gains), Math.max(0, ...gains, 1));
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];
  const x = (t: number) => Y_AXIS_W + (tMax > tMin ? ((t - tMin) / (tMax - tMin)) * plotW : plotW);
  const y = (v: number) => PAD_TOP + PLOT_H - ((v - yMin) / (yMax - yMin || 1)) * PLOT_H;

  const xTickCandidates = hasData ? timeTicks(range, tMin, tMax) : [];
  const maxXTicks = Math.max(2, Math.floor(plotW / 72));
  const every = Math.ceil(xTickCandidates.length / maxXTicks);
  const xTicks = xTickCandidates.filter((_, i) => i % every === 0);

  function linePath(samples: GainSample[]): string {
    let d = "";
    let pen = false;
    for (const s of samples) {
      if (s.gain === null) {
        pen = false;
        continue;
      }
      d += `${pen ? "L" : "M"}${x(s.t).toFixed(1)},${y(s.gain).toFixed(1)}`;
      pen = true;
    }
    return d;
  }

  function areaPath(samples: GainSample[]): string {
    const known = samples.filter((s) => s.gain !== null);
    if (known.length < 2) return "";
    const top = known.map((s, i) => `${i ? "L" : "M"}${x(s.t).toFixed(1)},${y(s.gain!).toFixed(1)}`).join("");
    return `${top}L${x(known[known.length - 1].t).toFixed(1)},${y(0)}L${x(known[0].t).toFixed(1)},${y(0)}Z`;
  }

  function nearestIndex(clientX: number): number | null {
    const el = wrapRef.current;
    if (!el || master.length === 0) return null;
    const px = clientX - el.getBoundingClientRect().left;
    let best = 0;
    for (let i = 1; i < master.length; i++) {
      if (Math.abs(x(master[i].t) - px) < Math.abs(x(master[best].t) - px)) best = i;
    }
    return best;
  }

  function onPointer(e: PointerEvent) {
    setActive(nearestIndex(e.clientX));
  }

  function onKeyDown(e: KeyboardEvent) {
    if (master.length === 0) return;
    const last = master.length - 1;
    const current = active ?? last;
    const next =
      e.key === "ArrowLeft" ? Math.max(0, current - 1)
      : e.key === "ArrowRight" ? Math.min(last, current + 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
  }

  const activeT = active !== null ? master[active]?.t : undefined;
  const readout =
    activeT !== undefined
      ? series.map((s) => ({ series: s, sample: sampleAt(s.samples, activeT) }))
      : [];
  const tooltipLeft = activeT !== undefined ? x(activeT) : 0;
  const flip = tooltipLeft > width * 0.6;

  return (
    <div
      ref={wrapRef}
      dir="ltr"
      className="relative select-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      style={{ height: HEIGHT }}
      tabIndex={hasData ? 0 : -1}
      role="group"
      aria-roledescription="chart"
      aria-label={label}
      onKeyDown={onKeyDown}
      onFocus={() => hasData && setActive((a) => a ?? master.length - 1)}
      onBlur={() => setActive(null)}
    >
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          className="block touch-pan-y"
          onPointerMove={onPointer}
          onPointerDown={onPointer}
          onPointerLeave={() => setActive(null)}
        >
          {ticks.map((v) => (
            <g key={v}>
              <line
                x1={Y_AXIS_W}
                x2={width - PAD_RIGHT}
                y1={y(v)}
                y2={y(v)}
                stroke={v === 0 ? "var(--border-strong)" : "var(--border)"}
                strokeWidth={1}
                shapeRendering="crispEdges"
              />
              <text
                x={Y_AXIS_W - 8}
                y={y(v)}
                dy="0.35em"
                textAnchor="end"
                className="fill-muted-2 text-[11px] tabular-nums"
              >
                {formatGain(v, locale)}
              </text>
            </g>
          ))}

          {xTicks.map((t) => {
            const px = x(t);
            const anchor = px < Y_AXIS_W + 24 ? "start" : px > width - PAD_RIGHT - 24 ? "end" : "middle";
            return (
              <text
                key={t}
                x={px}
                y={PAD_TOP + PLOT_H + 18}
                textAnchor={anchor}
                className="fill-muted-2 text-[11px] tabular-nums"
              >
                {tickLabel(range, t, locale)}
              </text>
            );
          })}

          {series.length === 1 && (
            <path d={areaPath(series[0].samples)} fill={series[0].color} fillOpacity={0.1} />
          )}
          {series.map((s) => (
            <path
              key={s.id}
              d={linePath(s.samples)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {/* End dots, or the crosshair's dots while one is active. */}
          {activeT !== undefined && (
            <line
              x1={x(activeT)}
              x2={x(activeT)}
              y1={PAD_TOP}
              y2={PAD_TOP + PLOT_H}
              stroke="var(--border-strong)"
              strokeWidth={1}
              shapeRendering="crispEdges"
            />
          )}
          {series.map((s) => {
            const point =
              activeT !== undefined ? sampleAt(s.samples, activeT) : [...s.samples].reverse().find((p) => p.gain !== null);
            if (!point || point.gain === null) return null;
            return (
              <circle
                key={s.id}
                cx={x(activeT ?? point.t)}
                cy={y(point.gain)}
                r={4}
                fill={s.color}
                stroke="var(--card)"
                strokeWidth={2}
              />
            );
          })}
        </svg>
      )}

      {!hasData && (
        <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted">
          {emptyLabel}
        </p>
      )}

      {activeT !== undefined && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-36 rounded-lg border border-border-strong bg-background-elevated/95 px-3 py-2 shadow-lg shadow-black/40"
          style={flip ? { right: width - tooltipLeft + 10 } : { left: tooltipLeft + 10 }}
          aria-live="polite"
        >
          <p className="mb-1 text-[11px] text-muted">{tooltipLabel(range, activeT, locale)}</p>
          {readout.map(({ series: s, sample }) => (
            <p key={s.id} className="flex items-center gap-2 text-sm">
              <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="font-semibold tabular-nums text-foreground">
                {sample && sample.gain !== null ? formatGain(sample.gain, locale) : "–"}
              </span>
              <span className="truncate text-xs text-muted">{s.label}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
