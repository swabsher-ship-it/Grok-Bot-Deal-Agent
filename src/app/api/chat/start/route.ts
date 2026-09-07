import { NextRequest, NextResponse } from "next/server";
import { getStore, saveStore, appendLog } from "@/lib/store";
import { uid, nowISO, parseUTM } from "@/lib/utils";
import { consentPrompt, initialAssistantMessage } from "@/lib/chat-engine";
import type { DeviceType, Region, LeadSource } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const store = getStore();
    const sessionId = String(body.sessionId || uid("sess"));
    const utm = parseUTM(body.utm || body);
    const source = (body.source as LeadSource) || (utm?.utm_source === "x" ? "x" : utm?.utm_source === "email" ? "email" : "landing_page");

    const leadId = uid("lead");
    const convId = uid("conv");
    const createdAt = nowISO();

    const welcome = initialAssistantMessage(store.config);
    const consent = consentPrompt();

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
    });

    store.conversations.unshift({
      id: convId,
      leadId,
      leadName: "Anonymous",
      leadPhone: "",
      mode: "AI Active",
      messages: [
        { id: uid("msg"), role: "assistant", content: welcome, createdAt },
        { id: uid("msg"), role: "assistant", content: consent, createdAt },
      ],
      createdAt,
      updatedAt: createdAt,
    });

    store.chatStarts.push({
      id: uid("cs"),
      sessionId,
      leadId,
      createdAt,
    });

    saveStore(store);
    appendLog("chat", "info", "Chat start / gate begun", { leadId, convId });

    return NextResponse.json({
      ok: true,
      leadId,
      conversationId: convId,
      sessionId,
      gate: { step: "consent" },
      messages: store.conversations[0].messages,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to start chat" }, { status: 500 });
  }
}
