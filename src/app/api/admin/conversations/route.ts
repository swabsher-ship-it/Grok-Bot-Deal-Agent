import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getStore, saveStore, appendLog } from "@/lib/store";
import { uid, nowISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "All";
  const q = (searchParams.get("q") || "").toLowerCase();
  let conversations = [...getStore().conversations];
  if (filter !== "All") {
    conversations = conversations.filter((c) => c.mode === filter);
  }
  if (q) {
    conversations = conversations.filter(
      (c) => c.leadName.toLowerCase().includes(q) || c.leadPhone.includes(q)
    );
  }
  conversations.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return NextResponse.json({ ok: true, conversations });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const store = getStore();
  const conv = store.conversations.find((c) => c.id === body.id);
  if (!conv) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  if (body.action === "takeover") {
    conv.mode = "Admin";
    appendLog("admin", "info", "Conversation takeover", { id: conv.id });
  } else if (body.action === "resolve") {
    conv.mode = "Resolved";
    appendLog("admin", "info", "Conversation resolved", { id: conv.id });
  } else if (body.action === "reply" && body.message) {
    conv.mode = "Admin";
    conv.messages.push({
      id: uid("msg"),
      role: "admin",
      content: String(body.message),
      createdAt: nowISO(),
    });
    appendLog("admin", "info", "Admin reply", { id: conv.id });
  }
  conv.updatedAt = nowISO();
  saveStore(store);
  return NextResponse.json({ ok: true, conversation: conv });
}
