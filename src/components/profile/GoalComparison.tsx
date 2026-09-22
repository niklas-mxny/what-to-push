"use client";

import Link from "next/link";
import { GoalSelect } from "@/components/GoalSelect";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { countReached, isGoalless } from "@/lib/goal";
import { usePublicPlayer } from "@/lib/hooks";
import { useT } from "@/lib/i18n";
import { useGoal } from "@/lib/storage";
import { useViewerTag } from "@/lib/use-viewer-tag";
import type { GoalConfig } from "@/types/domain";
import type { PublicPlayer } from "@/types/profile";

function ProgressRow({
  player,
  goal,
  tone,
  youLabel,
}: {
  player: PublicPlayer;
  goal: GoalConfig;
  tone: "primary" | "accent";
  youLabel?: string;
}) {
  const t = useT();
  const done = countReached(player.brawlerTrophies, goal);
  const total = player.totalBrawlers;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <PlayerAvatar src={player.iconUrl} name={player.name} size={36} className="ring-1 ring-border-strong" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-medium">{player.name}</span>
            {youLabel && <Badge tone="accent">{youLabel}</Badge>}
          </span>
          <span className="shrink-0 text-xs text-muted">
            <span className="hidden sm:inline">{t("goal.progressLabel", { done, total })}</span>
            <span className="sm:hidden">
              {done}/{total}
            </span>{" "}
            · <span className="font-semibold text-foreground">{pct}%</span>
          </span>
        </div>
        <ProgressBar
          value={done}
          max={total}
          toneClassName={tone === "accent" ? "bg-accent" : "bg-primary"}
          glowColor={tone === "accent" ? "var(--accent)" : undefined}
        />
      </div>
    </div>
  );
}

/**
 * This player's progress toward the viewer's current goal, side by side with
 * the viewer's own — so any two players can be compared at a glance.
 */
export function GoalComparison({ player }: { player: PublicPlayer }) {
  const t = useT();
  const viewerTag = useViewerTag();
  const isSelf = viewerTag !== "" && viewerTag === player.tag;
  const viewer = usePublicPlayer(viewerTag && !isSelf ? viewerTag : null);
  const { goal } = useGoal();

  const diff =
    viewer.data && !isGoalless(goal)
      ? countReached(viewer.data.player.brawlerTrophies, goal) - countReached(player.brawlerTrophies, goal)
      : null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-2">{t("compare.title")}</h2>
          <GoalSelect />
        </div>

        {isGoalless(goal) ? (
          <p className="text-sm text-muted">{t("compare.noGoal")}</p>
        ) : (
          <div className="flex flex-col gap-4">
            <ProgressRow
              player={player}
              goal={goal}
              tone={isSelf ? "accent" : "primary"}
              youLabel={isSelf ? t("compare.you") : undefined}
            />

            {!isSelf &&
              (!viewerTag ? (
                <p className="text-sm text-muted">
                  {t("compare.noOwnTag")}{" "}
                  <Link href="/settings" className="font-medium text-primary hover:underline">
                    {t("dashboard.noTag.cta")}
                  </Link>
                </p>
              ) : viewer.loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-white/5" />
                  <div className="h-8 flex-1 animate-pulse rounded-lg bg-white/5" />
                </div>
              ) : viewer.data ? (
                <ProgressRow player={viewer.data.player} goal={goal} tone="accent" youLabel={t("compare.you")} />
              ) : null)}

            {diff !== null && (
              <p className="text-xs text-muted">
                {diff > 0
                  ? t("compare.ahead", { count: diff })
                  : diff < 0
                    ? t("compare.behind", { count: -diff })
                    : t("compare.tied")}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
