"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";
import { ApiErrorNotice } from "@/components/ApiErrorNotice";
import { BestPickHero } from "@/components/BestPickHero";
import { GoalProgress } from "@/components/GoalProgress";
import { SlotRecommendationCard } from "@/components/SlotRecommendationCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getGoalLabel } from "@/lib/goal-label";
import { useRoster, useRotation } from "@/lib/hooks";
import { translateApiError, useT } from "@/lib/i18n";
import { recommendForAllSlots } from "@/lib/recommend";
import { useGoal, usePlayerTag } from "@/lib/storage";

export default function DashboardPage() {
  const t = useT();
  const { tag, hydrated } = usePlayerTag();
  const { goal } = useGoal();
  const rotation = useRotation();
  const roster = useRoster(tag, hydrated);

  const loading = rotation.loading || roster.loading || !hydrated;
  const error = rotation.error ?? roster.error;

  const recommendations =
    rotation.data && roster.data ? recommendForAllSlots(rotation.data, roster.data.roster, goal) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            {roster.data?.player ? t("dashboard.greeting", { name: roster.data.player.name }) : t("dashboard.title")}
          </h1>
          <p className="text-sm text-muted">{t("dashboard.subtitle")}</p>
        </div>
        <Link href="/settings">
          <Badge tone="primary" className="cursor-pointer px-3 py-1.5 text-sm">
            <Settings2 className="h-3.5 w-3.5" /> {t("dashboard.goalPrefix", { label: getGoalLabel(t, goal) })}
          </Badge>
        </Link>
      </div>

      {roster.data && <GoalProgress roster={roster.data.roster} goal={goal} />}

      {!hydrated ? null : !tag ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-3">
            <p className="text-sm text-foreground">{t("dashboard.noTag.message")}</p>
            <Link href="/settings">
              <Button size="sm">{t("dashboard.noTag.cta")}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {error && <ApiErrorNotice message={translateApiError(t, error)} hint={t("dashboard.errorHint")} />}

      {roster.data?.playerError && (
        <ApiErrorNotice
          message={t("dashboard.playerError", { message: translateApiError(t, roster.data.playerError) })}
          hint={t("dashboard.playerErrorHint")}
        />
      )}

      {loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-card border border-border bg-card/50" />
          ))}
        </div>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <>
          <BestPickHero recommendations={recommendations} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => (
              <SlotRecommendationCard key={rec.slot.slotId} rec={rec} />
            ))}
          </div>
        </>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <Card>
          <CardContent>
            <p className="text-sm text-muted">{t("dashboard.emptyRotation")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
