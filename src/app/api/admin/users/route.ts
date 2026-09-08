import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, hashPassword } from "@/lib/auth";
import { getStore, updateStore, appendLog } from "@/lib/store";
import { uid, nowISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const users = (await getStore()).users.map(({ passwordHash, ...u }) => u);
  return NextResponse.json({ ok: true, users });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (body.action === "create") {
    const email = String(body.email || "").toLowerCase();
    const passwordHash = await hashPassword(String(body.password || "change-me"));
    let safe = null;
    try {
      await updateStore((store) => {
        if (store.users.some((u) => u.email === email)) throw new Error("EXISTS");
        const user = {
          id: uid("user"),
          name: String(body.name || "Admin"),
          email,
          passwordHash,
          role: (body.role === "viewer" ? "viewer" : "admin") as "admin" | "viewer",
          active: true,
          createdAt: nowISO(),
        };
        store.users.push(user);
        const { passwordHash: _, ...rest } = user;
        safe = rest;
      });
    } catch (e) {
      if (e instanceof Error && e.message === "EXISTS") {
        return NextResponse.json({ ok: false, error: "Email exists" }, { status: 400 });
      }
      throw e;
    }
    await appendLog("admin", "info", "User created", { email });
    return NextResponse.json({ ok: true, user: safe });
  }

  if (body.action === "update") {
    let safe = null;
    try {
      await updateStore(async (store) => {
        const user = store.users.find((u) => u.id === body.id);
        if (!user) throw new Error("NOT_FOUND");
        if (body.name) user.name = String(body.name);
        if (body.email) user.email = String(body.email).toLowerCase();
        if (typeof body.active === "boolean") user.active = body.active;
        if (body.password) user.passwordHash = await hashPassword(String(body.password));
        const { passwordHash: _, ...rest } = user;
        safe = rest;
      });
    } catch (e) {
      if (e instanceof Error && e.message === "NOT_FOUND") {
        return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
      }
      throw e;
    }
    await appendLog("admin", "info", "User updated", { id: body.id });
    return NextResponse.json({ ok: true, user: safe });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
