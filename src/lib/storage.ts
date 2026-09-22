"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_GOAL, toPresetGoal, type GoalConfig } from "@/types/domain";

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

// useSyncExternalStore requires getSnapshot to return a *stable reference* when
// nothing changed — otherwise it re-renders forever. JSON.parse-ing on every call
// would violate that, so we cache the parsed value per key alongside the raw
// string it was parsed from, and only re-parse when the raw string differs.
const parsedCache = new Map<string, { raw: string | null; value: unknown }>();

function readLocalStorage<T>(key: string, fallback: T): T {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    raw = null;
  }

  const cached = parsedCache.get(key);
  if (cached && cached.raw === raw) {
    return cached.value as T;
  }

  let value = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  parsedCache.set(key, { raw, value });
  return value;
}

/**
 * Reads a localStorage-backed value via useSyncExternalStore, which is the
 * React-recommended way to bridge an external store: it serves `fallback`
 * during SSR/first paint and transparently swaps in the real client value
 * right after, with no manual effect/setState hydration dance.
 */
function useLocalStorageState<T>(key: string, fallback: T): [T, (value: T) => void, boolean] {
  const value = useSyncExternalStore(
    subscribe,
    () => readLocalStorage(key, fallback),
    () => fallback
  );

  const update = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // localStorage unavailable (private mode, quota) — in-memory only for this tab.
      }
      emitChange();
    },
    [key]
  );

  return [value, update, useHydrated()];
}

const noopSubscribe = () => () => {};

/**
 * True only once the client has hydrated. Server render and the client's first
 * hydration pass both report `false` (matching, so no mismatch); React then
 * forces one more client-only render where this flips to `true`. Standard
 * recipe for "isClient" checks — see https://react.dev/reference/react/useSyncExternalStore.
 */
function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export function usePlayerTag() {
  const [tag, setTag, hydrated] = useLocalStorageState<string>("wtp_player_tag", "");
  return { tag, setTag, hydrated };
}

export function useGoal() {
  const [stored, setGoal, hydrated] = useLocalStorageState<GoalConfig>("wtp_goal", DEFAULT_GOAL);
  // Old saves may hold a custom power/rank goal, which no longer exists.
  return { goal: toPresetGoal(stored), setGoal, hydrated };
}
