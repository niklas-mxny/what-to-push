"use client";

import { useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, User } from "lucide-react";
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
              <Card interactive>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-base font-bold">{tagMatch.name}</p>
                    <p className="text-xs text-muted">{tagMatch.tag}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone="accent">🏆 {tagMatch.trophies.toLocaleString()}</Badge>
                    {tagMatch.linkedUsername && (
                      <Link href={`/profile/${tagMatch.linkedUsername}`}>
                        <Button size="sm" variant="secondary">
                          {tagMatch.linkedUsername}
                        </Button>
                      </Link>
                    )}
                  </div>
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
