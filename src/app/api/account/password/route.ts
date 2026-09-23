import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { dbGet, dbRun } from "@/lib/db";

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

  const row = await dbGet<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", [user.id]);
  if (!row || !verifyPassword(currentPassword, row.password_hash)) {
    return NextResponse.json({ error: "Current password is incorrect.", code: "wrong_password" }, { status: 400 });
  }

  const currentSession = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  await dbRun("UPDATE users SET password_hash = ? WHERE id = ?", [hashPassword(newPassword), user.id]);
  await dbRun("DELETE FROM sessions WHERE user_id = ? AND id != ?", [user.id, currentSession]);

  return NextResponse.json({ ok: true });
}
