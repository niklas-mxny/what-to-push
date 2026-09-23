"use client";

import { useAuth } from "@/lib/auth-context";
import { usePlayerTag } from "@/lib/storage";
import { normalizePlayerTag } from "@/lib/tag";

/**
 * The player whose stats the app shows: when logged in with a linked tag that's
 * always the account's tag; otherwise the tag saved in this browser (Settings).
 * `hydrated` stays false until both the saved tag and the login state are known,
 * so pages don't briefly load the browser tag and then switch to the account's.
 */
export function useActivePlayerTag(): { tag: string; hydrated: boolean; fromAccount: boolean } {
  const { user, loading } = useAuth();
  const { tag: localTag, hydrated } = usePlayerTag();
  const accountTag = user?.playerTag ?? "";
  return {
    tag: normalizePlayerTag(accountTag || localTag || ""),
    hydrated: hydrated && !loading,
    fromAccount: Boolean(accountTag),
  };
}

/** The viewer's own Brawl Stars tag (normalized, "" if unknown) — see useActivePlayerTag. */
export function useViewerTag(): string {
  return useActivePlayerTag().tag;
}
