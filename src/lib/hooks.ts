"use client";

import { useEffect, useState } from "react";
import type { MergedBrawler, ActiveSlot } from "@/types/domain";

interface ApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

interface RotationResponse {
  slots: ActiveSlot[];
}

interface RosterResponse {
  roster: MergedBrawler[];
  player: { name: string; tag: string; trophies: number } | null;
  playerError: { error: string; code?: string } | null;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error ?? `Anfrage fehlgeschlagen (${res.status})`);
  }
  return body as T;
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
      .catch((err: Error) => {
        if (!cancelled) setState({ data: null, error: err.message, loading: false });
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
      .catch((err: Error) => {
        if (!cancelled) setState({ data: null, error: err.message, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [tag, hydrated]);

  return state;
}
