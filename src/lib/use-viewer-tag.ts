"use client";

import { useAuth } from "@/lib/auth-context";
import { usePlayerTag } from "@/lib/storage";
import { normalizePlayerTag } from "@/lib/tag";

/**
 * The viewer's own Brawl Stars tag (normalized, "" if unknown): the tag linked
 * to their account, falling back to the one saved in Settings.
 */
export function useViewerTag(): string {
  const { user } = useAuth();
  const { tag } = usePlayerTag();
  return normalizePlayerTag(user?.playerTag || tag || "");
}
