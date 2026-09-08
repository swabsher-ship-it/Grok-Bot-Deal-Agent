import { NextRequest, NextResponse } from "next/server";
import { updateStore, appendLog, trackEvent } from "@/lib/store";
import { uid, nowISO } from "@/lib/utils";
import { nextGateReply, type GateSession } from "@/lib/chat-engine";

export const dynamic = "force-dynamic";

function gateStepName(step: string): string | undefined {
  const map: Record<string, string> = {
    name: "name",
    email: "email",
    phone: "phone",
    sms: "sms_consent",
    confirm: "confirm",
  };
  return map[step];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const conversationId = String(body.conversationId || "");
    const message = String(body.message || "").trim();
    const gate = (body.gate || { step: "consent" }) as GateSession;
    const visitorId = body.visitorId ? String(body.visitorId) : undefined;
    const sessionId = body.sessionId ? String(body.sessionId) : undefined;

    if (!conversationId || !message) {
      return NextResponse.json({ ok: false, error: "conversationId and message required" }, { status: 400 });
    }

    type GateResult = ReturnType<typeof nextGateReply>;
    let result!: GateResult;
    let dataRoomUrl: string | undefined;
    let leadId: string | undefined;
    let outMessages: unknown[] = [];
    const prevStep = gate.step;
    let found = false;

    await updateStore((store) => {
      const conv = store.conversations.find((c) => c.id === conversationId);
      if (!conv) throw new Error("NOT_FOUND");
      found = true;

      const createdAt = nowISO();
      conv.messages.push({ id: uid("msg"), role: "user", content: message, createdAt });

      const gateResult = nextGateReply(gate, message, store.config);
      result = gateResult;
      conv.messages.push({
        id: uid("msg"),
        role: "assistant",
        content: gateResult.reply,
        createdAt: nowISO(),
      });
      conv.updatedAt = nowISO();

      const lead = store.leads.find((l) => l.id === conv.leadId);
      leadId = conv.leadId;
      if (lead && gateResult.leadPatch) {
        Object.assign(lead, gateResult.leadPatch, { updatedAt: nowISO() });
        if (gateResult.leadPatch.name) {
          conv.leadName = gateResult.leadPatch.name;
          lead.name = gateResult.leadPatch.name;
        }
        if (gateResult.leadPatch.phone) conv.leadPhone = gateResult.leadPatch.phone;
        if (gateResult.leadPatch.email) {
          lead.domain = gateResult.leadPatch.email.includes("@")
            ? gateResult.leadPatch.email.split("@")[1]
            : lead.domain;
        }
      }

      if (gateResult.unlock && lead) {
        lead.status = "Docs Sent";
        lead.state = "Send Documents";
        store.deliveries.unshift({
          id: uid("del"),
          leadId: lead.id,
          leadName: lead.name,
          channel: "EMAIL",
          to: lead.email,
          subject: "Your Quelliv Investor Preview / Data Room Access",
          preview: `Hi ${lead.name.split(" ")[0]}, Thanks for your interest in Quelliv! Here's your Investor Preview / Data Room link...`,
          status: "sent",
          createdAt: nowISO(),
        });
        dataRoomUrl = store.config.dataRoomUrl;
      }

      outMessages = conv.messages;
    });

    if (!found) {
      return NextResponse.json({ ok: false, error: "Chat failed" }, { status: 500 });
    }

    await trackEvent({
      type: "message_in",
      visitorId,
      sessionId,
      conversationId,
      leadId,
      meta: { len: message.length },
    });
    await trackEvent({
      type: "message_out",
      visitorId,
      sessionId,
      conversationId,
      leadId,
      meta: { len: result.reply.length },
    });

    const newStep = result.session.step;
    if (newStep !== prevStep) {
      const stepLabel = gateStepName(newStep);
      if (stepLabel) {
        await trackEvent({
          type: "gate_step",
          visitorId,
          sessionId,
          conversationId,
          leadId,
          step: stepLabel,
        });
      }
    }

    if (result.unlock) {
      await trackEvent({
        type: "unlock",
        visitorId,
        sessionId,
        conversationId,
        leadId,
        meta: { dataRoomUrl },
      });
      await appendLog("email", "info", "Investor Preview / Data Room access delivered", { leadId });
    }

    await appendLog("chat", "info", "Chat message processed", {
      conversationId,
      step: result.session.step,
    });

    return NextResponse.json({
      ok: true,
      reply: result.reply,
      gate: result.session,
      unlocked: Boolean(result.unlock),
      dataRoomUrl: result.unlock ? dataRoomUrl : undefined,
      messages: outMessages,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: "Chat failed" }, { status: 500 });
  }
}
