import { NextRequest, NextResponse } from "next/server";
import { trackEvent, updateStore, appendLog } from "@/lib/store";
import { parseUTM, uid, nowISO } from "@/lib/utils";
import type { AnalyticsEventType, DeviceType } from "@/lib/types";

export const dynamic = "force-dynamic";

const ALLOWED: AnalyticsEventType[] = [
  "pageview",
  "chat_launcher_open",
  "learn_more_click",
  "consent_checked",
  "chat_start",
  "gate_step",
  "unlock",
  "data_room_click",
  "message_in",
  "message_out",
  "admin_login",
  "takeover",
  "resolve",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = body.type as AnalyticsEventType;
    if (!ALLOWED.includes(type)) {
      return NextResponse.json({ ok: false, error: "Invalid event type" }, { status: 400 });
    }
    const utm = parseUTM(body.utm || body);
    const visitorId = body.visitorId ? String(body.visitorId) : undefined;
    const sessionId = body.sessionId ? String(body.sessionId) : uid("sess");
    const path = body.path ? String(body.path) : undefined;
    const device = (body.device as DeviceType) || undefined;

    // Mirror pageview into pageviews[] for funnel compatibility
    if (type === "pageview") {
      await updateStore((store) => {
        store.pageviews.push({
          id: uid("pv"),
          path: path || "/",
          referrer: body.referrer ? String(body.referrer) : undefined,
          device: device || "Desktop",
          region: "Other",
          utm,
          sessionId,
          visitorId,
          createdAt: nowISO(),
        });
      });
    }

    const event = await trackEvent({
      type,
      visitorId,
      sessionId,
      path,
      referrer: body.referrer ? String(body.referrer) : undefined,
      device,
      utm,
      step: body.step ? String(body.step) : undefined,
      leadId: body.leadId ? String(body.leadId) : undefined,
      conversationId: body.conversationId ? String(body.conversationId) : undefined,
      meta: body.meta && typeof body.meta === "object" ? body.meta : undefined,
    });

    if (type === "pageview") {
      await appendLog("api", "debug", "event pageview", { path });
    }

    return NextResponse.json({ ok: true, id: event.id, visitorId, sessionId });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
