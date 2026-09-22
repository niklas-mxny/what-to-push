"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search as SearchIcon, User } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useT } from "@/lib/i18n";

interface SearchUser {
  username: string;
  playerTag: string | null;
}
interface TagMatch {
  tag: string;
  name: string;
  iconUrl: string;
  trophies: number;
  linkedUsername: string | null;
}

export default function SearchPage() {
  const t = useT();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [tagMatch, setTagMatch] = useState<TagMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setUsers(data.users ?? []);
      setTagMatch(data.tagMatch ?? null);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{t("search.title")}</h1>
        <p className="text-sm text-muted">{t("search.subtitle")}</p>
      </div>

      <form onSubmit={runSearch} className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border-strong bg-background-elevated px-3 py-2">
          <SearchIcon className="h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-2"
          />
        </div>
        <Button type="submit" disabled={loading || !query.trim()}>
          {t("search.button")}
        </Button>
      </form>

      {searched && (
        <div className="flex flex-col gap-4">
          {tagMatch && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-2">
                {t("search.tagHeading")}
              </p>
              <Card interactive className="group">
                <CardContent className="flex items-center gap-3">
                  <Link href={`/player/${tagMatch.tag}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <PlayerAvatar
                      src={tagMatch.iconUrl}
                      name={tagMatch.name}
                      size={44}
                      className="ring-1 ring-border-strong"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-bold">{tagMatch.name}</p>
                      <p className="truncate text-xs text-muted">
                        #{tagMatch.tag}
                        {tagMatch.linkedUsername && <> · @{tagMatch.linkedUsername}</>}
                      </p>
                    </div>
                    <Badge tone="accent" className="ms-auto shrink-0">
                      🏆 {tagMatch.trophies.toLocaleString()}
                    </Badge>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                  </Link>
                  <FavoriteButton player={{ tag: tagMatch.tag, name: tagMatch.name, iconUrl: tagMatch.iconUrl }} />
                </CardContent>
              </Card>
            </div>
          )}

          {users.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-2">
                {t("search.usersHeading")}
              </p>
              <div className="flex flex-col gap-2">
                {users.map((u) => (
                  <Link key={u.username} href={`/profile/${u.username}`}>
                    <Card interactive>
                      <CardContent className="flex items-center gap-3 py-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background-elevated ring-1 ring-border-strong">
                          <User className="h-4 w-4 text-muted" />
                        </span>
                        <span className="font-medium">{u.username}</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!tagMatch && users.length === 0 && (
            <Card>
              <CardContent>
                <p className="text-sm text-muted">{t("search.noResults")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
