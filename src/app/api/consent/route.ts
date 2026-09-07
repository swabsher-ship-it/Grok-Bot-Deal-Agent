import { NextRequest, NextResponse } from "next/server";
import { getStore, saveStore, appendLog } from "@/lib/store";
import { nowISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const leadId = String(body.leadId || "");
    const store = getStore();
    const lead = store.leads.find((l) => l.id === leadId);
    if (!lead) {
      return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
    }
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
    saveStore(store);
    appendLog("chat", "info", "Consent recorded", { leadId });
    return NextResponse.json({ ok: true, consents: lead.consents });
  } catch {
    return NextResponse.json({ ok: false, error: "Consent failed" }, { status: 400 });
  }
}
