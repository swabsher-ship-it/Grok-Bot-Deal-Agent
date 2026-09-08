import { NextRequest, NextResponse } from "next/server";
import { updateStore, appendLog, trackEvent } from "@/lib/store";
import { nowISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const leadId = String(body.leadId || "");
    let consents = null;
    await updateStore((store) => {
      const lead = store.leads.find((l) => l.id === leadId);
      if (!lead) throw new Error("NOT_FOUND");
      lead.consents = {
        accreditedAck: Boolean(body.accreditedAck),
        confidentialityAck: Boolean(body.confidentialityAck),
        electronicDeliveryAck: Boolean(body.electronicDeliveryAck),
        aiDisclosureAck: Boolean(body.aiDisclosureAck),
        securitiesAck: Boolean(body.securitiesAck),
        smsConsent: Boolean(body.smsConsent),
        consentedAt: nowISO(),
      };
      lead.updatedAt = nowISO();
      consents = lead.consents;
    });
    await trackEvent({
      type: "consent_checked",
      leadId,
      visitorId: body.visitorId ? String(body.visitorId) : undefined,
      sessionId: body.sessionId ? String(body.sessionId) : undefined,
    });
    await appendLog("chat", "info", "Consent recorded", { leadId });
    return NextResponse.json({ ok: true, consents });
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: "Consent failed" }, { status: 400 });
  }
}
