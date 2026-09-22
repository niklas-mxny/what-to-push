import { Badge } from "@/components/ui/Badge";
import type { BrawlerRole } from "@/types/domain";

const ROLE_TONE: Record<BrawlerRole, "primary" | "accent" | "success" | "muted" | "danger" | "default"> = {
  Tank: "danger",
  "Damage Dealer": "accent",
  Marksman: "success",
  Artillery: "primary",
  Assassin: "default",
  Support: "success",
  Controller: "primary",
  Unbekannt: "muted",
};

export function RoleBadge({ role }: { role: BrawlerRole }) {
  return <Badge tone={ROLE_TONE[role]}>{role}</Badge>;
}
