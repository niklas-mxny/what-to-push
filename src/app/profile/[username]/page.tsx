"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Crown, Shield, Sparkles, Swords, Trophy, Users } from "lucide-react";
import { ApiErrorNotice } from "@/components/ApiErrorNotice";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";

interface ProfilePlayer {
  name: string;
  tag: string;
  trophies: number;
  highestTrophies: number;
  totalPrestigeLevel: number;
  expLevel: number;
  victories3v3: number;
  soloVictories: number;
  duoVictories: number;
  clubName: string | null;
  brawlersOwned: number;
}

interface ProfileData {
  username: string;
  playerTag: string | null;
  memberSince: string;
  player: ProfilePlayer | null;
  playerError: { error: string; code?: string } | null;
}

function StatTile({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string | number }) {
  return (
    <Card interactive className="group">
      <CardContent className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors duration-200 group-hover:bg-primary/25">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{value}</p>
          <p className="truncate text-xs text-muted">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const t = useT();
  const { user, linkTag } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
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
    setData((prev) => (prev ? { ...prev, playerTag: tagInput } : prev));
    // Re-fetch to pull the freshly-linked player's stats.
    const res = await fetch(`/api/profile/${encodeURIComponent(username)}`);
    if (res.ok) setData(await res.json());
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-card/50" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-card border border-border bg-card/50" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted">{t("profile.notFound")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{data.username}</h1>
        <p className="text-sm text-muted">
          {t("profile.memberSince", { date: new Date(`${data.memberSince.replace(" ", "T")}Z`).toLocaleDateString() })}
        </p>
      </div>

      {data.playerError && (
        <ApiErrorNotice message={data.playerError.error} />
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

      {data.player && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile icon={Trophy} label={t("profile.stats.trophies")} value={data.player.trophies.toLocaleString()} />
          <StatTile
            icon={Crown}
            label={t("profile.stats.highestTrophies")}
            value={data.player.highestTrophies.toLocaleString()}
          />
          <StatTile icon={Sparkles} label={t("profile.stats.prestigeTotal")} value={data.player.totalPrestigeLevel} />
          <StatTile icon={Shield} label={t("profile.stats.expLevel")} value={data.player.expLevel} />
          <StatTile icon={Swords} label={t("profile.stats.victories3v3")} value={data.player.victories3v3.toLocaleString()} />
          <StatTile icon={Users} label={t("profile.stats.brawlersOwned")} value={data.player.brawlersOwned} />
        </div>
      )}

      {data.playerTag && isOwnProfile && (
        <p className="text-xs text-muted-2">
          {t("profile.linkedTag", { tag: data.playerTag })}
        </p>
      )}
    </div>
  );
}
