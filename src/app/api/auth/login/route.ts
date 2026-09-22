import { NextResponse } from "next/server";
import { SESSION_COOKIE, createSession, normalizeUsername, verifyPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  player_tag: string | null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required.", code: "invalid_credentials" }, { status: 400 });
  }

  const db = getDb();
  const user = db
    .prepare("SELECT id, username, password_hash, player_tag FROM users WHERE username_lower = ?")
    .get(normalizeUsername(username)) as unknown as UserRow | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Incorrect username or password.", code: "invalid_credentials" }, { status: 401 });
  }

  const { token, expiresAt } = createSession(user.id);
  const res = NextResponse.json({ username: user.username, playerTag: user.player_tag });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return res;
}
