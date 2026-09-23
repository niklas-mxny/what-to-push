import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, destroySession } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await destroySession(token);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", expires: new Date(0) });
  return res;
}
