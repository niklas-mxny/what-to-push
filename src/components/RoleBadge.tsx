"use client";

import { GameIcon } from "@/components/GameIcon";
import { Badge } from "@/components/ui/Badge";
import { CLASS_ICONS } from "@/lib/fankit-ui";
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
  const icon = CLASS_ICONS[role];
  return (
    <Badge tone={ROLE_TONE[role]}>
      {icon && <GameIcon file={icon} size={12} />}
      {t(`role.${role}`)}
    </Badge>
  );
}
