"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { GoalSelect } from "@/components/GoalSelect";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { translateApiError, useT } from "@/lib/i18n";
import { usePlayerTag } from "@/lib/storage";
import { normalizePlayerTag } from "@/lib/tag";
import { useActivePlayerTag } from "@/lib/use-viewer-tag";

export default function SettingsPage() {
  const t = useT();
  const { user, linkTag } = useAuth();
  const { setTag } = usePlayerTag();
  const { tag } = useActivePlayerTag();
  const [tagInput, setTagInput] = useState(tag);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive local editable state from the store during render (React's
  // recommended alternative to a sync-on-mount effect): once `tag` resolves
  // (from the account or localStorage), or changes elsewhere, the input snaps
  // to the new value without an extra effect round-trip.
  const [prevTag, setPrevTag] = useState(tag);
  if (tag !== prevTag) {
    setPrevTag(tag);
    setTagInput(tag);
  }

  async function saveTag() {
    const next = normalizePlayerTag(tagInput);
    setError(null);
    // Logged in, the tag belongs to the account (and is loaded from it on
    // every device); the API also checks that it exists.
    if (user) {
      setSaving(true);
      const result = await linkTag(next);
      setSaving(false);
      if (!result.ok) {
        setError(translateApiError(t, { message: result.error ?? "", code: result.code }));
        return;
      }
    }
    setTag(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{t("settings.title")}</h1>
        <p className="text-sm text-muted">{t("settings.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.tag.title")}</CardTitle>
          <CardDescription>{t("settings.tag.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex flex-1 items-center rounded-lg border border-border-strong bg-background-elevated px-3">
              <span className="text-muted">#</span>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value.toUpperCase().replace(/^#/, ""))}
                placeholder={t("settings.tag.placeholder")}
                className="w-full bg-transparent py-2 pl-1 text-sm outline-none placeholder:text-muted-2"
              />
            </div>
            <Button onClick={saveTag} disabled={saving || !tagInput.trim()}>
              {saved ? <Check className="h-4 w-4" /> : t("settings.tag.save")}
            </Button>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          {user && (
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Link2 className="h-3.5 w-3.5 shrink-0 text-primary" />
              {t("settings.tag.account", { username: user.username })}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="relative z-20">
        <CardHeader>
          <CardTitle>{t("settings.goal.title")}</CardTitle>
          <CardDescription>{t("settings.goal.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <GoalSelect variant="field" align="start" />
        </CardContent>
      </Card>

      <Card className="relative z-10">
        <CardHeader>
          <CardTitle>{t("settings.language.title")}</CardTitle>
          <CardDescription>{t("settings.language.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSelector variant="field" align="start" />
        </CardContent>
      </Card>
    </div>
  );
}
