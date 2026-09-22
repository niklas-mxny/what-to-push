import type { ActiveSlot } from "@/types/domain";

/**
 * The raw rotation sometimes lists the exact same mode+map twice (e.g. a
 * ranked slot alongside the casual one), and Solo/Duo/Trio Showdown always
 * come as three separate slots. Collapse both cases down to one card each —
 * Showdown counts as a single entry regardless of map, everything else
 * collapses only on an exact mode+map match. When multiple slots collapse
 * into one, keep whichever has the latest endTime.
 */
export function dedupeSlots(slots: ActiveSlot[]): ActiveSlot[] {
  const groups = new Map<string, ActiveSlot>();
  for (const slot of slots) {
    const groupKey = slot.modeKey === "showdown" ? "showdown" : `${slot.modeKey}:${slot.mapName}`;
    const existing = groups.get(groupKey);
    if (!existing || new Date(slot.endTime).getTime() > new Date(existing.endTime).getTime()) {
      groups.set(groupKey, slot);
    }
  }
  return Array.from(groups.values());
}
