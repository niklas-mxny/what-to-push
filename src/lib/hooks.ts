"use client";

import { useEffect, useState } from "react";
import { normalizePlayerTag } from "@/lib/tag";
import type { TrophyHistory, TrophyRange } from "@/lib/trophy-activity";
import type { MergedBrawler, ActiveSlot } from "@/types/domain";
import type { PlayerResponse, PublicClub } from "@/types/profile";

export interface ApiError {
  message: string;
  code?: string;
}

interface ApiState<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
}

interface RotationResponse {
  slots: ActiveSlot[];
}

interface RosterResponse {
  roster: MergedBrawler[];
  player: { name: string; tag: string; trophies: number } | null;
  playerError: ApiError | null;
}

class ApiRequestError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) {
    throw new ApiRequestError(body.error ?? `Request failed (${res.status})`, body.code);
  }
  return body as T;
}

function toApiError(err: unknown): ApiError {
  if (err instanceof ApiRequestError) return { message: err.message, code: err.code };
  return { message: err instanceof Error ? err.message : String(err) };
}

const ROTATION_REFRESH_AFTER_HIDDEN_MS = 5 * 60_000;

/**
 * The current rotation. Refetches on its own when the earliest slot ends and
 * when the tab becomes visible again after a while, so a dashboard left open
 * overnight doesn't keep showing (or silently drop) yesterday's slots.
 */
export function useRotation(): ApiState<ActiveSlot[]> {
  const [state, setState] = useState<ApiState<ActiveSlot[]> & { fetchedAt: number }>({
    data: null,
    error: null,
    loading: true,
    fetchedAt: 0,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchJson<RotationResponse>("/api/rotation")
      .then((res) => {
        if (!cancelled) setState({ data: res.slots, error: null, loading: false, fetchedAt: Date.now() });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ data: null, error: toApiError(err), loading: false, fetchedAt: Date.now() });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const { data, fetchedAt } = state;

  useEffect(() => {
    if (!data || data.length === 0) return;
    const nextEnd = Math.min(...data.map((s) => new Date(s.endTime).getTime()));
    // A few seconds of slack so the API has already rotated the slot.
    const delay = Math.max(nextEnd - Date.now() + 5_000, 5_000);
    // setTimeout can't hold more than ~24.8 days; a rotation slot never lasts that long.
    const timer = setTimeout(() => setReloadKey((k) => k + 1), Math.min(delay, 2 ** 31 - 1));
    return () => clearTimeout(timer);
  }, [data]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible" && Date.now() - fetchedAt > ROTATION_REFRESH_AFTER_HIDDEN_MS) {
        setReloadKey((k) => k + 1);
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchedAt]);

  return { data: state.data, error: state.error, loading: state.loading };
}

export function useRoster(tag: string, hydrated: boolean): ApiState<RosterResponse> {
  const [state, setState] = useState<ApiState<RosterResponse>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    const url = tag ? `/api/roster?tag=${encodeURIComponent(tag)}` : "/api/roster";
    fetchJson<RosterResponse>(url)
      .then((res) => {
        if (!cancelled) setState({ data: res, error: null, loading: false });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ data: null, error: toApiError(err), loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [tag, hydrated]);

  return state;
}

/**
 * Fetches a JSON resource for `url` (or nothing for null). Results are stored
 * with the URL they belong to; a stale entry for another URL just reads as
 * "loading" — no synchronous reset needed in the effect.
 */
function useResource<T>(url: string | null): ApiState<T> {
  const [state, setState] = useState<{ url: string | null; data: T | null; error: ApiError | null }>({
    url: null,
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    fetchJson<T>(url)
      .then((res) => {
        if (!cancelled) setState({ url, data: res, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ url, data: null, error: toApiError(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!url) return { data: null, error: null, loading: false };
  if (state.url !== url) return { data: null, error: null, loading: true };
  return { data: state.data, error: state.error, loading: false };
}

/** Full public stats for any player tag (or nothing, for a null/empty tag). */
export function usePublicPlayer(tag: string | null): ApiState<PlayerResponse> {
  const key = tag ? normalizePlayerTag(tag) : "";
  return useResource<PlayerResponse>(key ? `/api/player/${encodeURIComponent(key)}` : null);
}

/** A club with its member list, by club tag. */
export function usePublicClub(tag: string): ApiState<{ club: PublicClub }> {
  const key = normalizePlayerTag(tag);
  return useResource<{ club: PublicClub }>(key ? `/api/club/${encodeURIComponent(key)}` : null);
}

/** How often an open trophy chart asks for new data (only while the tab is visible). */
const TROPHY_REFRESH_MS = 2 * 60 * 1000;

/**
 * Recorded trophy history for the activity chart, refreshed every couple of
 * minutes while the page is visible. While another range loads, the previous
 * one stays (`stale: true`), so the chart holds its frame instead of flashing
 * a skeleton; a failed background refresh keeps the data it had.
 */
export function useTrophyHistory(
  tag: string | null,
  range: TrophyRange
): {
  data: TrophyHistory | null;
  /** The range `data` belongs to — while loading, the previous one. */
  dataRange: TrophyRange;
  error: ApiError | null;
  loading: boolean;
  stale: boolean;
} {
  const key = tag ? normalizePlayerTag(tag) : "";
  const url = key ? `/api/player/${encodeURIComponent(key)}/trophies?range=${range}` : null;
  const [state, setState] = useState<{
    url: string | null;
    tag: string;
    range: TrophyRange;
    data: TrophyHistory | null;
    error: ApiError | null;
    fetchedAt: number;
  }>({ url: null, tag: "", range, data: null, error: null, fetchedAt: 0 });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    fetchJson<TrophyHistory>(url)
      .then((res) => {
        if (!cancelled) setState({ url, tag: key, range, data: res, error: null, fetchedAt: Date.now() });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState((prev) =>
          prev.url === url && prev.data
            ? { ...prev, fetchedAt: Date.now() }
            : { url, tag: key, range, data: null, error: toApiError(err), fetchedAt: Date.now() }
        );
      });
    return () => {
      cancelled = true;
    };
  }, [url, key, range, reloadKey]);

  const { fetchedAt } = state;
  useEffect(() => {
    if (!url || !fetchedAt) return;
    const refresh = () => setReloadKey((k) => k + 1);
    // A hidden tab skips its turn and catches up when it's shown again.
    const timer = setTimeout(() => document.visibilityState === "visible" && refresh(), TROPHY_REFRESH_MS);
    function onVisible() {
      if (document.visibilityState === "visible" && Date.now() - fetchedAt >= TROPHY_REFRESH_MS) refresh();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [url, fetchedAt]);

  if (!url) return { data: null, dataRange: range, error: null, loading: false, stale: false };
  if (state.url === url) {
    return { data: state.data, dataRange: state.range, error: state.error, loading: false, stale: false };
  }
  // Only the same player's data may stand in for the new range.
  const previous = state.tag === key ? state.data : null;
  return { data: previous, dataRange: state.range, error: null, loading: true, stale: previous !== null };
}
