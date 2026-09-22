"use client";

import { useEffect, useState } from "react";
import { normalizePlayerTag } from "@/lib/tag";
import type { MergedBrawler, ActiveSlot } from "@/types/domain";
import type { PlayerResponse } from "@/types/profile";

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

/** Full public stats for any player tag (or nothing, for a null/empty tag). */
export function usePublicPlayer(tag: string | null): ApiState<PlayerResponse> {
  const key = tag ? normalizePlayerTag(tag) : "";
  // Results are stored with the tag they belong to; a stale entry for another
  // tag just reads as "loading" — no synchronous reset needed in the effect.
  const [state, setState] = useState<{ key: string; data: PlayerResponse | null; error: ApiError | null }>({
    key: "",
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetchJson<PlayerResponse>(`/api/player/${encodeURIComponent(key)}`)
      .then((res) => {
        if (!cancelled) setState({ key, data: res, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ key, data: null, error: toApiError(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  if (!key) return { data: null, error: null, loading: false };
  if (state.key !== key) return { data: null, error: null, loading: true };
  return { data: state.data, error: state.error, loading: false };
}
