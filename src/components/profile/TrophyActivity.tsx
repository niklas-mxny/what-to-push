"use client";

import { useState } from "react";
import Link from "next/link";
import { TrophyGainChart, formatGain, type GainSeries } from "@/components/profile/TrophyGainChart";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/cn";
import { useTrophyHistory } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { normalizePlayerTag } from "@/lib/tag";
import {
  TROPHY_RANGES,
  TROPHY_RANGE_MS,
  gainCurve,
  totalGain,
  type TrophyRange,
} from "@/lib/trophy-activity";
import type { PublicPlayer } from "@/types/profile";

const RANGE_LABELS: Record<TrophyRange, string> = { "1d": "1D", "1w": "1W", "1m": "1M", "1y": "1Y" };

function RangeToggle({ value, onChange, label }: { value: TrophyRange; onChange: (r: TrophyRange) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex rounded-full border border-border-strong bg-background-elevated p-0.5">
      {TROPHY_RANGES.map((r) => (
        <button
          key={r}
          type="button"
          aria-pressed={r === value}
          onClick={() => onChange(r)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
            r === value ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
          )}
        >
          {RANGE_LABELS[r]}
        </button>
      ))}
    </div>
  );
}

/**
 * How many trophies this player gained over time, from the history this site
 * records (the API has none). Signed in with a linked tag, on someone else's
 * profile, the viewer's own curve is drawn alongside for comparison.
 */
export function TrophyActivity({ player }: { player: PublicPlayer }) {
  const { t, locale } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const [range, setRange] = useState<TrophyRange>("1w");

  const viewerTag = user?.playerTag ? normalizePlayerTag(user.playerTag) : null;
  const isSelf = viewerTag === player.tag;
  const own = useTrophyHistory(player.tag, range);
  const viewer = useTrophyHistory(viewerTag && !isSelf ? viewerTag : null, range);

  const series: GainSeries[] = [];
  if (own.data) {
    series.push({
      id: "player",
      label: player.name,
      color: isSelf ? "var(--chart-you)" : "var(--chart-player)",
      samples: gainCurve(own.data, own.dataRange),
    });
  }
  if (viewer.data) {
    series.push({
      id: "viewer",
      label: t("compare.you"),
      color: "var(--chart-you)",
      samples: gainCurve(viewer.data, viewer.dataRange),
    });
  }
  const totals = series.map((s) => totalGain(s.samples));
  const period = t(`trophyActivity.period.${range}`);
  const comparing = series.length === 2;
  const diff = comparing && totals[0] !== null && totals[1] !== null ? totals[1]! - totals[0]! : null;

  const rangeStart = (own.data?.now ?? 0) - TROPHY_RANGE_MS[range];
  const since = own.data?.since ?? null;
  const recordingStartedInRange = since !== null && since > rangeStart;

  const summary = series
    .map((s, i) => `${s.label} ${totals[i] === null ? "–" : formatGain(totals[i]!, locale)}`)
    .join(", ");

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-2">
            {t("trophyActivity.title")}
          </h2>
          <RangeToggle value={range} onChange={setRange} label={t("trophyActivity.rangeLabel")} />
        </div>

        {own.error ? (
          <p className="text-sm text-muted">{t("trophyActivity.error")}</p>
        ) : !own.data ? (
          <div className="flex flex-col gap-3">
            <div className="h-8 w-40 animate-pulse rounded-lg bg-white/5" />
            <div className="h-[216px] animate-pulse rounded-lg bg-white/5" />
          </div>
        ) : (
          <div className={cn("flex flex-col gap-3 transition-opacity", (own.stale || viewer.stale) && "opacity-60")}>
            {comparing ? (
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {series.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <span className="h-0.5 w-4 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="font-display text-lg font-bold">
                      {totals[i] === null ? "–" : formatGain(totals[i]!, locale)}
                    </span>
                    <span className="truncate text-sm text-muted">{s.label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-2xl font-bold">
                  {totals[0] === null || totals[0] === undefined ? "–" : formatGain(totals[0], locale)}
                </span>
                <span className="text-sm text-muted">{t("trophyActivity.trophiesIn", { period })}</span>
              </p>
            )}

            <TrophyGainChart
              series={series}
              range={own.dataRange}
              locale={locale}
              label={`${t("trophyActivity.title")}, ${period}: ${summary}`}
              emptyLabel={t("trophyActivity.empty")}
            />
          </div>
        )}

        <div className="flex flex-col gap-1 text-xs text-muted">
          {diff !== null && (
            <p>
              {diff > 0
                ? t("trophyActivity.ahead", { count: diff.toLocaleString(locale), period })
                : diff < 0
                  ? t("trophyActivity.behind", { count: (-diff).toLocaleString(locale), period })
                  : t("trophyActivity.tied", { period })}
            </p>
          )}
          {!isSelf && !authLoading && !user && (
            <p>
              {t("trophyActivity.loginToCompare")}{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                {t("nav.login")}
              </Link>
            </p>
          )}
          {user && !viewerTag && (
            <p>
              {t("trophyActivity.noOwnTag")}{" "}
              <Link href="/settings" className="font-medium text-primary hover:underline">
                {t("dashboard.noTag.cta")}
              </Link>
            </p>
          )}
          {recordingStartedInRange && (
            <p>
              {t("trophyActivity.since", {
                date: new Date(since).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }),
              })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
