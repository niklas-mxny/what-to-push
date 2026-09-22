"use client";

import { useT } from "@/lib/i18n";

export function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-2 sm:px-6">
      {t("app.disclaimer")}
    </footer>
  );
}
