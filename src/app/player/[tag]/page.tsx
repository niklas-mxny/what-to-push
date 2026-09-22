"use client";

import { use } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { ApiErrorNotice } from "@/components/ApiErrorNotice";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PlayerHeader, ProfileSkeleton } from "@/components/profile/PlayerHeader";
import { PlayerStats } from "@/components/profile/PlayerStats";
import { Card, CardContent } from "@/components/ui/Card";
import { usePublicPlayer } from "@/lib/hooks";
import { translateApiError, useT } from "@/lib/i18n";
import { useViewerTag } from "@/lib/use-viewer-tag";

/** Profile for any Brawl Stars player by tag — same stats as an account profile, no sign-up needed. */
export default function PlayerPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = use(params);
  const t = useT();
  const viewerTag = useViewerTag();
  const { data, error, loading } = usePublicPlayer(decodeURIComponent(tag));

  if (loading) return <ProfileSkeleton />;

  if (error || !data) {
    return error?.code === "not_found" || !error ? (
      <Card>
        <CardContent>
          <p className="text-sm text-muted">{t("profile.notFound")}</p>
        </CardContent>
      </Card>
    ) : (
      <ApiErrorNotice message={translateApiError(t, error)} />
    );
  }

  const { player: p, linkedUsername } = data;
  const isOwnTag = viewerTag === p.tag;

  return (
    <div className="flex flex-col gap-6">
      <PlayerHeader
        name={p.name}
        iconUrl={p.iconUrl}
        actions={isOwnTag ? null : <FavoriteButton player={{ tag: p.tag, name: p.name, iconUrl: p.iconUrl }} />}
      >
        {linkedUsername && (
          <Link
            href={`/profile/${linkedUsername}`}
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-primary"
          >
            <UserRound className="h-3.5 w-3.5" />
            {t("profile.registeredAs", { username: linkedUsername })}
          </Link>
        )}
        <p className="text-xs text-muted-2">{[p.clubName, `#${p.tag}`].filter(Boolean).join(" · ")}</p>
      </PlayerHeader>

      <PlayerStats player={p} />
    </div>
  );
}
