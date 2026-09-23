import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";

/**
 * Change the signed-in user's password (the in-app counterpart of
 * scripts/reset-password.mjs). Requires the current password; every other
 * session of the account is signed out, the current one stays signed in.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in.", code: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters.", code: "weak_password" },
      { status: 400 }
    );
  }

  const db = getDb();
  const row = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(user.id) as unknown as
    | { password_hash: string }
    | undefined;
  if (!row || !verifyPassword(currentPassword, row.password_hash)) {
    return NextResponse.json({ error: "Current password is incorrect.", code: "wrong_password" }, { status: 400 });
  }

  const currentSession = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(newPassword), user.id);
  db.prepare("DELETE FROM sessions WHERE user_id = ? AND id != ?").run(user.id, currentSession);

  return NextResponse.json({ ok: true });
}
