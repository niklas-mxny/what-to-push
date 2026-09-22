"use client";

import { ChevronDown, Globe } from "lucide-react";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import { cn } from "@/lib/cn";
import { LOCALES, useI18n } from "@/lib/i18n";

/** Language picker — "pill" for the nav bar, "field" for the settings form. */
export function LanguageSelector({
  variant = "pill",
  align = "end",
  className,
}: {
  variant?: "pill" | "field";
  align?: "start" | "end";
  className?: string;
}) {
  const { t, locale, setLocale } = useI18n();
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <Dropdown
      label={t("settings.language.title")}
      align={align}
      className={cn(variant === "field" && "w-full", className)}
      triggerClassName={
        variant === "pill"
          ? "nav-link-glow flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1.5 text-sm text-muted hover:border-primary/40 hover:text-foreground aria-expanded:border-primary/60 aria-expanded:text-foreground"
          : "flex w-full items-center gap-2 rounded-lg border border-border-strong bg-background-elevated px-3 py-2 text-sm text-foreground transition-colors hover:border-primary/50 aria-expanded:border-primary/60"
      }
      panelClassName="max-h-80 w-48 overflow-y-auto scrollbar-thin"
      trigger={
        <>
          <Globe className="h-4 w-4 shrink-0" strokeWidth={2.25} />
          {variant === "pill" ? (
            <>
              <span className="hidden text-foreground sm:inline">{current.name}</span>
              <span className="text-xs font-semibold uppercase text-foreground sm:hidden">{current.code}</span>
            </>
          ) : (
            <span className="flex-1 text-start">{current.name}</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-aria-expanded/trigger:rotate-180" />
        </>
      }
    >
      {(close) =>
        LOCALES.map((l) => (
          <DropdownOption
            key={l.code}
            selected={l.code === locale}
            onSelect={() => {
              setLocale(l.code);
              close();
            }}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-foreground">{l.name}</span>
              <span className="text-xs uppercase text-muted-2">{l.code}</span>
            </span>
          </DropdownOption>
        ))
      }
    </Dropdown>
  );
}
