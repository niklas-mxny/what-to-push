"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useGoal, usePlayerTag } from "@/lib/storage";
import { GOAL_PRESETS, type GoalConfig, type GoalType } from "@/types/domain";

export default function SettingsPage() {
  const { tag, setTag } = usePlayerTag();
  const { goal, setGoal } = useGoal();
  const [tagInput, setTagInput] = useState(tag);
  const [saved, setSaved] = useState(false);
  const [customType, setCustomType] = useState<GoalType>(goal.type);
  const [customTarget, setCustomTarget] = useState(goal.target);

  // Derive local editable state from the store during render (React's
  // recommended alternative to a sync-on-mount effect): once `tag`/`goal`
  // resolve from localStorage after hydration, or change elsewhere, the local
  // copies below snap to the new value without an extra effect round-trip.
  const [prevTag, setPrevTag] = useState(tag);
  if (tag !== prevTag) {
    setPrevTag(tag);
    setTagInput(tag);
  }
  const [prevGoal, setPrevGoal] = useState<GoalConfig>(goal);
  if (goal !== prevGoal) {
    setPrevGoal(goal);
    setCustomType(goal.type);
    setCustomTarget(goal.target);
  }

  function saveTag() {
    setTag(tagInput.trim().toUpperCase().replace(/^#/, ""));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Einstellungen</h1>
        <p className="text-sm text-muted">Spieler-Tag und dein Fortschritts-Ziel.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spieler-Tag</CardTitle>
          <CardDescription>
            Zu finden in Brawl Stars unter deinem Profil, z.B. #2Y8VQGCCV.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex flex-1 items-center rounded-lg border border-border-strong bg-background-elevated px-3">
              <span className="text-muted">#</span>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value.toUpperCase().replace(/^#/, ""))}
                placeholder="2Y8VQGCCV"
                className="w-full bg-transparent py-2 pl-1 text-sm outline-none placeholder:text-muted-2"
              />
            </div>
            <Button onClick={saveTag} disabled={!tagInput.trim()}>
              {saved ? <Check className="h-4 w-4" /> : "Speichern"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dein Ziel</CardTitle>
          <CardDescription>
            Bestimmt, welche Brawler priorisiert empfohlen werden — z.B. alle auf Power 11
            bringen, oder gezielt Trophäen pushen.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {GOAL_PRESETS.map((preset) => {
            const active = goal.type === preset.type && goal.target === preset.target;
            return (
              <button
                key={preset.label}
                onClick={() => setGoal({ type: preset.type, target: preset.target })}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-border-strong hover:bg-white/[0.03]"
                )}
              >
                {preset.label}
                {active && <Badge tone="primary">Aktiv</Badge>}
              </button>
            );
          })}

          <div className="mt-2 rounded-lg border border-border p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-2">
              Eigenes Ziel
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as GoalType)}
                className="rounded-lg border border-border-strong bg-background-elevated px-2 py-1.5 text-sm outline-none"
              >
                <option value="power">Power-Level</option>
                <option value="trophies">Trophäen</option>
                <option value="rank">Rang (Prestige)</option>
              </select>
              <input
                type="number"
                min={1}
                value={customTarget}
                onChange={(e) => setCustomTarget(Number(e.target.value))}
                className="w-24 rounded-lg border border-border-strong bg-background-elevated px-2 py-1.5 text-sm outline-none"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setGoal({ type: customType, target: customTarget })}
              >
                Übernehmen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
