"use client";

import { useEffect, useState } from "react";
import type { MergedBrawler, ActiveSlot } from "@/types/domain";

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
