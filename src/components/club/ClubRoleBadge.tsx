"use client";

import { Badge } from "@/components/ui/Badge";
import { useT } from "@/lib/i18n";
import type { ClubRole } from "@/types/brawlstars";

const ROLE_TONE: Record<ClubRole, "accent" | "primary" | "success" | "muted"> = {
  president: "accent",
  vicePresident: "primary",
  senior: "success",
  member: "muted",
  notMember: "muted",
  unknown: "muted",
};

export function ClubRoleBadge({ role }: { role: ClubRole }) {
  const t = useT();
  if (role === "notMember" || role === "unknown") return null;
  return <Badge tone={ROLE_TONE[role]}>{t(`club.role.${role}`)}</Badge>;
}
