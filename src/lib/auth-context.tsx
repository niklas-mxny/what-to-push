"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface AuthUser {
  username: string;
  playerTag: string | null;
}

interface ActionResult {
  ok: boolean;
  error?: string;
  /** Stable error code from the API, for translateApiError. */
  code?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signup: (username: string, password: string) => Promise<ActionResult>;
  login: (username: string, password: string) => Promise<ActionResult>;
  logout: () => Promise<void>;
  linkTag: (tag: string) => Promise<ActionResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<ActionResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signup = useCallback(async (username: string, password: string): Promise<ActionResult> => {
    const { ok, data } = await postJson("/api/auth/signup", { username, password });
    if (!ok) return { ok: false, error: data.error ?? "Sign up failed." };
    setUser({ username: data.username, playerTag: data.playerTag });
    return { ok: true };
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<ActionResult> => {
    const { ok, data } = await postJson("/api/auth/login", { username, password });
    if (!ok) return { ok: false, error: data.error ?? "Login failed." };
    setUser({ username: data.username, playerTag: data.playerTag });
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const linkTag = useCallback(async (tag: string): Promise<ActionResult> => {
    const { ok, data } = await postJson("/api/account/link-tag", { tag });
    if (!ok) return { ok: false, error: data.error ?? "Couldn't link that tag.", code: data.code };
    setUser((prev) => (prev ? { ...prev, playerTag: data.playerTag } : prev));
    return { ok: true };
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<ActionResult> => {
    const { ok, data } = await postJson("/api/account/password", { currentPassword, newPassword });
    if (!ok) return { ok: false, error: data.error ?? "Couldn't change the password.", code: data.code };
    return { ok: true };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, linkTag, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
