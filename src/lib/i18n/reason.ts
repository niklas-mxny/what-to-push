import type { TFunction } from "@/lib/i18n/context";
import type { ReasonEntry } from "@/types/domain";

/**
 * Reason params carry the raw BrawlerRole identifier (e.g. "Tank") rather than
 * pre-translated text, so the role name follows the current locale even though
 * it's nested inside another translated sentence. Resolve it here before
 * formatting the outer string.
 */
export function formatReason(t: TFunction, reason: ReasonEntry): string {
  const params = reason.params;
  if (params && typeof params.role === "string") {
    return t(reason.key, { ...params, role: t(`role.${params.role}`) });
  }
  return t(reason.key, params);
}

export function formatReasons(t: TFunction, reasons: ReasonEntry[]): string {
  return reasons.map((r) => formatReason(t, r)).join(" · ");
}
