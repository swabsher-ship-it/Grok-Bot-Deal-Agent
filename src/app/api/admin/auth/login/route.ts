import { NextRequest, NextResponse } from "next/server";
import { getStore, appendLog, trackEvent } from "@/lib/store";
import { createSession, verifyPassword, sessionCookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const store = await getStore();
    const user = store.users.find((u) => u.email.toLowerCase() === email);
    if (!user || !user.active) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }
    const token = await createSession(user.id, user.email);
    await trackEvent({ type: "admin_login", meta: { email: user.email } });
    await appendLog("admin", "info", "Admin login", { email: user.email });
    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
    res.cookies.set(sessionCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Login failed" }, { status: 500 });
  }
}
