import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, hashPassword } from "@/lib/auth";
import { getStore, saveStore, appendLog } from "@/lib/store";
import { uid, nowISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const users = getStore().users.map(({ passwordHash, ...u }) => u);
  return NextResponse.json({ ok: true, users });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const store = getStore();

  if (body.action === "create") {
    const email = String(body.email || "").toLowerCase();
    if (store.users.some((u) => u.email === email)) {
      return NextResponse.json({ ok: false, error: "Email exists" }, { status: 400 });
    }
    const passwordHash = await hashPassword(String(body.password || "change-me"));
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
    saveStore(store);
    appendLog("admin", "info", "User created", { email });
    const { passwordHash: _, ...safe } = user;
    return NextResponse.json({ ok: true, user: safe });
  }

  if (body.action === "update") {
    const user = store.users.find((u) => u.id === body.id);
    if (!user) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    if (body.name) user.name = String(body.name);
    if (body.email) user.email = String(body.email).toLowerCase();
    if (typeof body.active === "boolean") user.active = body.active;
    if (body.password) user.passwordHash = await hashPassword(String(body.password));
    saveStore(store);
    appendLog("admin", "info", "User updated", { id: user.id });
    const { passwordHash: _, ...safe } = user;
    return NextResponse.json({ ok: true, user: safe });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
