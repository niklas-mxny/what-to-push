"use client";

import { use } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Lock, Users } from "lucide-react";
import { ApiErrorNotice } from "@/components/ApiErrorNotice";
import { ClubRoleBadge } from "@/components/club/ClubRoleBadge";
import { GameIcon } from "@/components/GameIcon";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { UI_ICONS } from "@/lib/fankit-ui";
import { usePublicClub } from "@/lib/hooks";
import { translateApiError, useT } from "@/lib/i18n";
import { useViewerTag } from "@/lib/use-viewer-tag";

const MAX_MEMBERS = 30;

function ClubStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center">{icon}</span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{value}</p>
          <p className="truncate text-xs text-muted">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ClubSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="h-22 w-22 animate-pulse rounded-2xl bg-card/60" />
        <div className="h-12 w-full max-w-xs animate-pulse rounded-card bg-card/50" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-card border border-border bg-card/50" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-card border border-border bg-card/50" />
    </div>
  );
}

/** A club with every member — each member row opens that player's profile. */
export default function ClubPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = use(params);
  const t = useT();
  const viewerTag = useViewerTag();
  const { data, error, loading } = usePublicClub(decodeURIComponent(tag));

  if (loading) return <ClubSkeleton />;

  if (error || !data) {
    return error?.code === "not_found" || !error ? (
      <Card>
        <CardContent>
          <p className="text-sm text-muted">{t("club.notFound")}</p>
        </CardContent>
      </Card>
    ) : (
      <ApiErrorNotice message={translateApiError(t, error)} />
    );
  }

  const { club } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <GameIcon
          src={club.badgeUrl}
          alt=""
          size={88}
          className="glow-drop"
          fallback={<Users className="h-12 w-12 text-primary" />}
        />
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">{club.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-2">
            <span>#{club.tag}</span>
            <Badge tone={club.type === "open" ? "success" : "muted"}>{t(`club.type.${club.type}`)}</Badge>
          </div>
        </div>
      </div>

      {club.description && (
        <p className="whitespace-pre-line break-words text-sm text-muted">{club.description}</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ClubStat
          icon={<GameIcon file={UI_ICONS.trophy} size={34} />}
          label={t("club.trophies")}
          value={club.trophies.toLocaleString()}
        />
        <ClubStat
          icon={
            <span className="relative">
              <GameIcon file={UI_ICONS.trophy} size={34} />
              <Lock className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-sm bg-background-elevated p-0.5 text-muted" />
            </span>
          }
          label={t("club.requiredTrophies")}
          value={club.requiredTrophies.toLocaleString()}
        />
        <ClubStat
          icon={<Users className="h-7 w-7 text-primary" />}
          label={t("club.members")}
          value={`${club.members.length}/${MAX_MEMBERS}`}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-2">
          {t("club.members")} ({club.members.length})
        </h2>
        <Card className="overflow-hidden">
          <ol className="divide-y divide-border">
            {club.members.map((m, i) => {
              const isViewer = m.tag === viewerTag;
              return (
                <li key={m.tag}>
                  <Link
                    href={`/player/${m.tag}`}
                    className={cn(
                      "group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary/10",
                      isViewer && "bg-accent/[0.06]"
                    )}
                  >
                    <span className="w-6 shrink-0 text-end text-sm font-bold text-muted-2">{i + 1}</span>
                    <PlayerAvatar src={m.iconUrl} name={m.name} size={40} className="ring-1 ring-border-strong" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="truncate font-semibold"
                          style={m.nameColor ? { color: m.nameColor } : undefined}
                        >
                          {m.name}
                        </span>
                        <ClubRoleBadge role={m.role} />
                        {isViewer && <Badge tone="accent">{t("compare.you")}</Badge>}
                      </div>
                      <p className="truncate text-xs text-muted-2">
                        #{m.tag}
                        {m.linkedUsername && <> · @{m.linkedUsername}</>}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold">
                      <GameIcon file={UI_ICONS.trophy} size={18} />
                      {m.trophies.toLocaleString()}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-2 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>
    </div>
  );
}
