import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getStore, updateStore, appendLog, trackEvent } from "@/lib/store";
import { uid, nowISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "All";
  const q = (searchParams.get("q") || "").toLowerCase();
  let conversations = [...(await getStore()).conversations];
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
  let conv = null;
  await updateStore((store) => {
    const found = store.conversations.find((c) => c.id === body.id);
    if (!found) throw new Error("NOT_FOUND");
    if (body.action === "takeover") {
      found.mode = "Admin";
    } else if (body.action === "resolve") {
      found.mode = "Resolved";
    } else if (body.action === "reply" && body.message) {
      found.mode = "Admin";
      found.messages.push({
        id: uid("msg"),
        role: "admin",
        content: String(body.message),
        createdAt: nowISO(),
      });
    }
    found.updatedAt = nowISO();
    conv = found;
  });
  if (!conv) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  if (body.action === "takeover") {
    await trackEvent({ type: "takeover", conversationId: body.id, leadId: (conv as { leadId: string }).leadId });
    await appendLog("admin", "info", "Conversation takeover", { id: body.id });
  } else if (body.action === "resolve") {
    await trackEvent({ type: "resolve", conversationId: body.id, leadId: (conv as { leadId: string }).leadId });
    await appendLog("admin", "info", "Conversation resolved", { id: body.id });
  } else if (body.action === "reply") {
    await appendLog("admin", "info", "Admin reply", { id: body.id });
  }
  return NextResponse.json({ ok: true, conversation: conv });
}
