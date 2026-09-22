"use client";

import { Globe } from "lucide-react";
import { LOCALES, useI18n } from "@/lib/i18n";
import type { LocaleCode } from "@/lib/i18n";

export function LanguageSelector({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <label
      className={`flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1.5 text-sm text-muted ${className ?? ""}`}
    >
      <Globe className="h-4 w-4" strokeWidth={2.25} />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as LocaleCode)}
        className="bg-transparent text-foreground outline-none [&>option]:bg-background-elevated"
        aria-label="Language"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </label>
  );
}
