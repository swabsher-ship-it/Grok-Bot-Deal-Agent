import { NextRequest, NextResponse } from "next/server";
import { updateStore, appendLog, trackEvent } from "@/lib/store";
import { uid, nowISO, parseUTM } from "@/lib/utils";
import { consentPrompt, initialAssistantMessage } from "@/lib/chat-engine";
import type { ConsentRecord, DeviceType, Region, LeadSource } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = String(body.sessionId || uid("sess"));
    const visitorId = body.visitorId ? String(body.visitorId) : undefined;
    const utm = parseUTM(body.utm || body);
    const source = (body.source as LeadSource) || (utm?.utm_source === "x" ? "x" : utm?.utm_source === "email" ? "email" : "landing_page");

    const leadId = uid("lead");
    const convId = uid("conv");
    const createdAt = nowISO();

    let welcome = "";
    let messages: { id: string; role: "assistant"; content: string; createdAt: string }[] = [];
    let gateStep = "interest";
    let consents: ConsentRecord | undefined;

    await updateStore((store) => {
      welcome = initialAssistantMessage(store.config);
      const uiConsent = Boolean(body.aiConsent);
      const consent = consentPrompt();
      gateStep = uiConsent ? "interest" : "consent";

      consents = uiConsent
        ? {
            accreditedAck: false,
            confidentialityAck: false,
            electronicDeliveryAck: true,
            aiDisclosureAck: true,
            securitiesAck: true,
            smsConsent: false,
            consentedAt: createdAt,
          }
        : undefined;

      store.leads.unshift({
        id: leadId,
        name: "Anonymous",
        email: "",
        phone: "",
        status: "New",
        state: "Interest Check",
        source,
        domain: "",
        device: (body.device as DeviceType) || "Desktop",
        region: (body.region as Region) || "Other",
        isTest: Boolean(body.isTest),
        createdAt,
        updatedAt: createdAt,
        utm,
        conversationId: convId,
        consents,
        visitorId,
        sessionId,
      });

      messages = uiConsent
        ? [{ id: uid("msg"), role: "assistant" as const, content: welcome, createdAt }]
        : [
            { id: uid("msg"), role: "assistant" as const, content: welcome, createdAt },
            { id: uid("msg"), role: "assistant" as const, content: consent, createdAt },
          ];

      store.conversations.unshift({
        id: convId,
        leadId,
        leadName: "Anonymous",
        leadPhone: "",
        mode: "AI Active",
        messages,
        createdAt,
        updatedAt: createdAt,
      });

      store.chatStarts.push({
        id: uid("cs"),
        sessionId,
        visitorId,
        leadId,
        createdAt,
      });
    });

    await trackEvent({
      type: "chat_start",
      visitorId,
      sessionId,
      device: (body.device as DeviceType) || "Desktop",
      utm,
      leadId,
      conversationId: convId,
      path: body.path ? String(body.path) : undefined,
    });
    if (body.aiConsent) {
      await trackEvent({
        type: "consent_checked",
        visitorId,
        sessionId,
        leadId,
        conversationId: convId,
      });
    }
    await appendLog("chat", "info", "Chat start / gate begun", { leadId, convId });

    return NextResponse.json({
      ok: true,
      leadId,
      conversationId: convId,
      sessionId,
      visitorId,
      gate: { step: gateStep, consents },
      messages,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to start chat" }, { status: 500 });
  }
}
