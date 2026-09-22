import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSession,
  hashPassword,
  isValidUsername,
  normalizeUsername,
} from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: "Username must be 3-20 characters: letters, numbers, _ or -.", code: "invalid_username" },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters.", code: "weak_password" },
      { status: 400 }
    );
  }

  const db = getDb();
  const usernameLower = normalizeUsername(username);
  const existing = db.prepare("SELECT id FROM users WHERE username_lower = ?").get(usernameLower);
  if (existing) {
    return NextResponse.json(
      { error: "That username is already taken.", code: "username_taken" },
      { status: 409 }
    );
  }

  const passwordHash = hashPassword(password);
  const result = db
    .prepare("INSERT INTO users (username, username_lower, password_hash) VALUES (?, ?, ?)")
    .run(username, usernameLower, passwordHash);
  const userId = Number(result.lastInsertRowid);

  const { token, expiresAt } = createSession(userId);
  const res = NextResponse.json({ username, playerTag: null });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return res;
}
