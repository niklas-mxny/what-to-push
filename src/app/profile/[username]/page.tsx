"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Image from "next/image";
import { Medal, Shield, Sparkles, Swords, Trophy, UserRound, Users } from "lucide-react";
import { ApiErrorNotice } from "@/components/ApiErrorNotice";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";

interface RankInfo {
  rankName: string;
  elo: number | null;
  iconUrl: string;
}

interface FameInfo {
  value: number;
  tierName: string;
}

interface ProfilePlayer {
  name: string;
  tag: string;
  iconUrl: string;
  trophies: number;
  totalPrestigeLevel: number;
  victories3v3: number;
  soloVictories: number;
  duoVictories: number;
  clubName: string | null;
  brawlersOwned: number;
  fame: FameInfo | null;
  rankedCurrent: RankInfo | null;
  rankedHighest: RankInfo | null;
}

interface ProfileData {
  username: string;
  playerTag: string | null;
  memberSince: string;
  player: ProfilePlayer | null;
  playerError: { error: string; code?: string } | null;
}

function Avatar({ src, name, size = 88 }: { src: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className="glow-ring-accent relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-elevated ring-2 ring-accent/60"
      style={{ width: size, height: size }}
    >
      {!failed ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          unoptimized
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-display text-2xl font-bold text-muted">{name.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
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

function RankCard({ label, rank }: { label: string; rank: RankInfo }) {
  const t = useT();
  const [iconFailed, setIconFailed] = useState(false);
  return (
    <Card interactive>
      <CardContent className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-background-elevated ring-1 ring-border-strong">
          {!iconFailed ? (
            <Image
              src={rank.iconUrl}
              alt={rank.rankName}
              width={48}
              height={48}
              unoptimized
              onError={() => setIconFailed(true)}
              className="object-contain"
            />
          ) : (
            <Medal className="h-6 w-6 text-accent" />
          )}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-2">{label}</p>
          <p className="truncate font-display text-base font-bold">{rank.rankName}</p>
          {rank.elo != null && <p className="text-xs text-muted">{t("profile.ranked.elo", { elo: rank.elo })}</p>}
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
    const res = await fetch(`/api/profile/${encodeURIComponent(username)}`);
    if (res.ok) setData(await res.json());
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-20 w-full max-w-md animate-pulse rounded-card bg-card/50" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
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

  const p = data.player;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar src={p?.iconUrl ?? ""} name={data.username} />
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">{p?.name ?? data.username}</h1>
          {p && <p className="text-sm text-muted">{data.username}</p>}
          <p className="text-xs text-muted-2">
            {[p?.clubName, p?.tag].filter(Boolean).join(" · ") ||
              t("profile.memberSince", { date: new Date(`${data.memberSince.replace(" ", "T")}Z`).toLocaleDateString() })}
          </p>
        </div>
      </div>

      {data.playerError && <ApiErrorNotice message={data.playerError.error} />}

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

      {p && (
        <>
          <div className="glow-ring-accent relative overflow-hidden rounded-card border border-accent/40 bg-gradient-to-br from-accent/20 via-card to-card p-6">
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-accent" />
                <div>
                  <p className="font-display text-3xl font-bold">{p.trophies.toLocaleString()}</p>
                  <p className="text-xs text-muted">{t("profile.stats.trophies")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-display text-3xl font-bold">{p.totalPrestigeLevel}</p>
                  <p className="text-xs text-muted">{t("profile.stats.prestigeTotal")}</p>
                </div>
              </div>
            </div>
          </div>

          {(p.rankedCurrent || p.rankedHighest) && (
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-2">
                {t("profile.ranked.title")}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {p.rankedCurrent && <RankCard label={t("profile.ranked.current")} rank={p.rankedCurrent} />}
                {p.rankedHighest && <RankCard label={t("profile.ranked.highest")} rank={p.rankedHighest} />}
              </div>
            </div>
          )}

          {p.fame && (
            <Card interactive>
              <CardContent className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <Shield className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-lg font-bold">
                    {p.fame.value.toLocaleString()} <span className="text-sm font-normal text-muted">— {p.fame.tierName}</span>
                  </p>
                  <p className="text-xs text-muted">{t("profile.fame.title")}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile icon={Swords} label={t("profile.stats.victories3v3")} value={p.victories3v3.toLocaleString()} />
            <StatTile icon={UserRound} label={t("profile.stats.soloShowdownWins")} value={p.soloVictories.toLocaleString()} />
            <StatTile icon={Users} label={t("profile.stats.duoShowdownWins")} value={p.duoVictories.toLocaleString()} />
            <StatTile icon={Medal} label={t("profile.stats.brawlersOwned")} value={p.brawlersOwned} />
          </div>
        </>
      )}

      {data.playerTag && isOwnProfile && (
        <p className="text-xs text-muted-2">{t("profile.linkedTag", { tag: data.playerTag })}</p>
      )}
    </div>
  );
}
