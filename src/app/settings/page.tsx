"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { GoalSelect } from "@/components/GoalSelect";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useT } from "@/lib/i18n";
import { usePlayerTag } from "@/lib/storage";

export default function SettingsPage() {
  const t = useT();
  const { tag, setTag } = usePlayerTag();
  const [tagInput, setTagInput] = useState(tag);
  const [saved, setSaved] = useState(false);

  // Derive local editable state from the store during render (React's
  // recommended alternative to a sync-on-mount effect): once `tag` resolves
  // from localStorage after hydration, or changes elsewhere, the input snaps
  // to the new value without an extra effect round-trip.
  const [prevTag, setPrevTag] = useState(tag);
  if (tag !== prevTag) {
    setPrevTag(tag);
    setTagInput(tag);
  }

  function saveTag() {
    setTag(tagInput.trim().toUpperCase().replace(/^#/, ""));
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
        <CardContent>
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
            <Button onClick={saveTag} disabled={!tagInput.trim()}>
              {saved ? <Check className="h-4 w-4" /> : t("settings.tag.save")}
            </Button>
          </div>
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
