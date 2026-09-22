"use client";

import { useEffect, useState } from "react";
import { normalizePlayerTag } from "@/lib/tag";
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

export function useRotation(): ApiState<ActiveSlot[]> {
  const [state, setState] = useState<ApiState<ActiveSlot[]>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    fetchJson<RotationResponse>("/api/rotation")
      .then((res) => {
        if (!cancelled) setState({ data: res.slots, error: null, loading: false });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ data: null, error: toApiError(err), loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
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
