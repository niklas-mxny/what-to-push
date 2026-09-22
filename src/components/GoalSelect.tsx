"use client";

import { ChevronDown, Target } from "lucide-react";
import { GameIcon } from "@/components/GameIcon";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import { cn } from "@/lib/cn";
import { UI_ICONS } from "@/lib/fankit-ui";
import { getGoalLabel } from "@/lib/goal-label";
import { useT } from "@/lib/i18n";
import { useGoal } from "@/lib/storage";
import { GOAL_PRESETS } from "@/types/domain";

/**
 * Goal picker used wherever the goal is shown. "pill" is the compact badge
 * look (dashboard header, profile comparison); "field" is a full-width
 * form control (settings).
 */
export function GoalSelect({
  variant = "pill",
  align = "end",
  className,
}: {
  variant?: "pill" | "field";
  align?: "start" | "end";
  className?: string;
}) {
  const t = useT();
  const { goal, setGoal } = useGoal();
  const label = getGoalLabel(t, goal);

  return (
    <Dropdown
      label={t("goal.select")}
      align={align}
      className={cn(variant === "field" && "w-full", className)}
      triggerClassName={
        variant === "pill"
          ? "btn-glow inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-3 py-1.5 text-sm font-medium text-[#c4b0ff] hover:border-primary/60 hover:bg-primary/25 aria-expanded:border-primary/60 aria-expanded:bg-primary/25"
          : "flex w-full items-center gap-2 rounded-lg border border-border-strong bg-background-elevated px-3 py-2 text-sm text-foreground transition-colors hover:border-primary/50 aria-expanded:border-primary/60"
      }
      panelClassName="w-72 max-w-[calc(100vw-2rem)]"
      trigger={
        <>
          <Target className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
          <span className={cn("truncate", variant === "field" && "flex-1 text-start")}>
            {variant === "pill" ? t("dashboard.goalPrefix", { label }) : label}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-aria-expanded/trigger:rotate-180" />
        </>
      }
    >
      {(close) =>
        GOAL_PRESETS.map((preset) => (
          <DropdownOption
            key={`${preset.type}-${preset.target}`}
            selected={preset === goal}
            onSelect={() => {
              setGoal(preset);
              close();
            }}
          >
            <span className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                  preset.type === "none" ? "bg-white/5 text-muted" : "bg-accent/15 text-accent"
                )}
              >
                {preset.type === "none" ? (
                  <Target className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : (
                  <GameIcon file={UI_ICONS.prestigeTrophy} size={22} />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-foreground">{getGoalLabel(t, preset)}</span>
                <span className="block text-xs text-muted-2">
                  {preset.type === "none"
                    ? t("goal.hint.none")
                    : t("goal.hint.prestige", { target: preset.target.toLocaleString() })}
                </span>
              </span>
            </span>
          </DropdownOption>
        ))
      }
    </Dropdown>
  );
}
