import { NextRequest, NextResponse } from "next/server";
import { getStore, saveStore, appendLog } from "@/lib/store";
import { uid, nowISO } from "@/lib/utils";
import { nextGateReply, type GateSession } from "@/lib/chat-engine";
import { canSendSms } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const conversationId = String(body.conversationId || "");
    const message = String(body.message || "").trim();
    const gate = (body.gate || { step: "consent" }) as GateSession;

    if (!conversationId || !message) {
      return NextResponse.json({ ok: false, error: "conversationId and message required" }, { status: 400 });
    }

    const store = getStore();
    const conv = store.conversations.find((c) => c.id === conversationId);
    if (!conv) {
      return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 });
    }
    if (conv.mode === "Admin" || conv.mode === "Resolved") {
      // still allow user messages but note mode
    }

    const createdAt = nowISO();
    conv.messages.push({ id: uid("msg"), role: "user", content: message, createdAt });

    const result = nextGateReply(gate, message, store.config);
    conv.messages.push({
      id: uid("msg"),
      role: "assistant",
      content: result.reply,
      createdAt: nowISO(),
    });
    conv.updatedAt = nowISO();

    const lead = store.leads.find((l) => l.id === conv.leadId);
    if (lead && result.leadPatch) {
      Object.assign(lead, result.leadPatch, { updatedAt: nowISO() });
      if (result.leadPatch.name) {
        conv.leadName = result.leadPatch.name;
        lead.name = result.leadPatch.name;
      }
      if (result.leadPatch.phone) conv.leadPhone = result.leadPatch.phone;
      if (result.leadPatch.email) {
        lead.domain = result.leadPatch.email.includes("@")
          ? result.leadPatch.email.split("@")[1]
          : lead.domain;
      }
    }

    if (result.unlock && lead) {
      lead.status = "Docs Sent";
      lead.state = "Send Documents";
      store.deliveries.unshift({
        id: uid("del"),
        leadId: lead.id,
        leadName: lead.name,
        channel: "EMAIL", // SMS outbound disabled until A2P VERIFIED; consent-only
        to: lead.email,
        subject: "Your Quelliv Investor Preview / Data Room Access",
        preview: `Hi ${lead.name.split(" ")[0]}, Thanks for your interest in Quelliv! Here's your Investor Preview / Data Room link...`,
        status: "sent",
        createdAt: nowISO(),
      });
      appendLog("email", "info", "Investor Preview / Data Room access delivered", { leadId: lead.id });
    }

    saveStore(store);
    appendLog("chat", "info", "Chat message processed", {
      conversationId,
      step: result.session.step,
    });

    return NextResponse.json({
      ok: true,
      reply: result.reply,
      gate: result.session,
      unlocked: Boolean(result.unlock),
      dataRoomUrl: result.unlock ? store.config.dataRoomUrl : undefined,
      messages: conv.messages,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Chat failed" }, { status: 500 });
  }
}
