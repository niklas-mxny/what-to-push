"use client";

import { use, useEffect, useState } from "react";
import { ApiErrorNotice } from "@/components/ApiErrorNotice";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PlayerHeader, ProfileSkeleton } from "@/components/profile/PlayerHeader";
import { PlayerStats } from "@/components/profile/PlayerStats";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { translateApiError, useT } from "@/lib/i18n";
import { useViewerTag } from "@/lib/use-viewer-tag";
import type { ProfileResponse } from "@/types/profile";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const t = useT();
  const { user, linkTag } = useAuth();
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/profile/${encodeURIComponent(username)}`)
      .then(async (res) => {
        if (!res.ok) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const json = await res.json();
        if (!cancelled) setData(json);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  const viewerTag = useViewerTag();
  const isOwnProfile = user?.username.toLowerCase() === username.toLowerCase();

  async function handleLinkTag(e: React.FormEvent) {
    e.preventDefault();
    setLinking(true);
    setLinkError(null);
    const result = await linkTag(tagInput);
    setLinking(false);
    if (!result.ok) {
      setLinkError(result.error ?? "Failed to link tag.");
      return;
    }
    const res = await fetch(`/api/profile/${encodeURIComponent(username)}`);
    if (res.ok) setData(await res.json());
  }

  if (loading) return <ProfileSkeleton />;

  if (notFound || !data) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted">{t("profile.notFound")}</p>
        </CardContent>
      </Card>
    );
  }

  const p = data.player;

  return (
    <div className="flex flex-col gap-6">
      <PlayerHeader
        name={p?.name ?? data.username}
        iconUrl={p?.iconUrl ?? ""}
        actions={
          p && !isOwnProfile && viewerTag !== p.tag ? (
            <FavoriteButton player={{ tag: p.tag, name: p.name, iconUrl: p.iconUrl }} />
          ) : null
        }
      >
        {p && <p className="text-sm text-muted">@{data.username}</p>}
        <p className="text-xs text-muted-2">
          {p
            ? [p.clubName, `#${p.tag}`].filter(Boolean).join(" · ")
            : t("profile.memberSince", {
                date: new Date(`${data.memberSince.replace(" ", "T")}Z`).toLocaleDateString(),
              })}
        </p>
      </PlayerHeader>

      {data.playerError && (
        <ApiErrorNotice message={translateApiError(t, { message: data.playerError.error, code: data.playerError.code })} />
      )}

      {!data.playerTag && isOwnProfile && (
        <Card>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-foreground">{t("profile.noTagLinked")}</p>
            <form onSubmit={handleLinkTag} className="flex gap-2">
              <div className="flex flex-1 items-center rounded-lg border border-border-strong bg-background-elevated px-3">
                <span className="text-muted">#</span>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value.toUpperCase().replace(/^#/, ""))}
                  placeholder={t("profile.linkTagPlaceholder")}
                  className="w-full bg-transparent py-2 pl-1 text-sm outline-none placeholder:text-muted-2"
                />
              </div>
              <Button type="submit" disabled={linking || !tagInput.trim()}>
                {t("profile.linkTagButton")}
              </Button>
            </form>
            {linkError && <p className="text-sm text-danger">{linkError}</p>}
          </CardContent>
        </Card>
      )}

      {!data.playerTag && !isOwnProfile && (
        <Card>
          <CardContent>
            <p className="text-sm text-muted">{t("profile.noTagLinked")}</p>
          </CardContent>
        </Card>
      )}

      {p && <PlayerStats player={p} />}

      {data.playerTag && isOwnProfile && (
        <p className="text-xs text-muted-2">{t("profile.linkedTag", { tag: data.playerTag })}</p>
      )}
    </div>
  );
}
