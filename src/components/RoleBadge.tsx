"use client";

import { Badge } from "@/components/ui/Badge";
import { useT } from "@/lib/i18n";
import type { BrawlerRole } from "@/types/domain";

const ROLE_TONE: Record<BrawlerRole, "primary" | "accent" | "success" | "muted" | "danger" | "default"> = {
  Tank: "danger",
  DamageDealer: "accent",
  Marksman: "success",
  Artillery: "primary",
  Assassin: "default",
  Support: "success",
  Controller: "primary",
  Unknown: "muted",
};

export function RoleBadge({ role }: { role: BrawlerRole }) {
  const t = useT();
  return <Badge tone={ROLE_TONE[role]}>{t(`role.${role}`)}</Badge>;
}
