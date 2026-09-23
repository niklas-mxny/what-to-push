import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { dbGet, dbRun } from "@/lib/db";

export const SESSION_COOKIE = "wtp_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface AuthUser {
  id: number;
  username: string;
  playerTag: string | null;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const candidate = scryptSync(password, salt, 64);
  if (hashBuffer.length !== candidate.length) return false;
  return timingSafeEqual(hashBuffer, candidate);
}

export async function createSession(userId: number): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await dbRun("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", [
    token,
    userId,
    expiresAt.toISOString(),
  ]);
  return { token, expiresAt };
}

export async function destroySession(token: string): Promise<void> {
  await dbRun("DELETE FROM sessions WHERE id = ?", [token]);
}

interface SessionRow {
  id: number;
  username: string;
  playerTag: string | null;
  expiresAt: string;
}

export async function getUserBySession(token: string | undefined): Promise<AuthUser | null> {
  if (!token) return null;
  const row = await dbGet<SessionRow>(
    `SELECT users.id AS id, users.username AS username, users.player_tag AS playerTag, sessions.expires_at AS expiresAt
     FROM sessions JOIN users ON users.id = sessions.user_id
     WHERE sessions.id = ?`,
    [token]
  );

  if (!row) return null;
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    await destroySession(token);
    return null;
  }
  return { id: row.id, username: row.username, playerTag: row.playerTag };
}

/** The signed-in user for the current request (route handlers only). */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  return getUserBySession(cookieStore.get(SESSION_COOKIE)?.value);
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}
