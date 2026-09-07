import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession, sessionCookieName } from "@/lib/auth";
import { appendLog } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(sessionCookieName())?.value;
  if (token) destroySession(token);
  appendLog("admin", "info", "Admin logout");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieName(), "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
