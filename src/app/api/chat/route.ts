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

      // Access is never taken from the client. This app has no data-room login.
      const gateResult = nextGateReply(gate, message, store.config, false);
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

      // A completed access request is not verified data-room access.
      // Do not email or return an offering link.

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
        meta: { accessRequest: true },
      });
      await appendLog("chat", "info", "Access request recorded", { leadId });
    }

    await appendLog("chat", "info", "Chat message processed", {
      conversationId,
      step: result.session.step,
    });

    return NextResponse.json({
      ok: true,
      reply: result.reply,
      gate: result.session,
      unlocked: false,
      messages: outMessages,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: "Chat failed" }, { status: 500 });
  }
}
