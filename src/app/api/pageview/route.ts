import { NextRequest, NextResponse } from "next/server";
import { updateStore, appendLog, trackEvent } from "@/lib/store";
import { uid, nowISO, parseUTM } from "@/lib/utils";
import type { DeviceType, Region } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const utm = parseUTM(body.utm || body);
    const sessionId = String(body.sessionId || uid("sess"));
    const visitorId = body.visitorId ? String(body.visitorId) : undefined;
    const createdAt = nowISO();
    const pageview = {
      id: uid("pv"),
      path: String(body.path || "/"),
      referrer: body.referrer ? String(body.referrer) : undefined,
      device: (body.device as DeviceType) || "Desktop",
      region: (body.region as Region) || "Other",
      utm,
      sessionId,
      visitorId,
      createdAt,
    };
    await updateStore((store) => {
      store.pageviews.push(pageview);
    });
    await trackEvent({
      type: "pageview",
      visitorId,
      sessionId,
      path: pageview.path,
      referrer: pageview.referrer,
      device: pageview.device,
      utm,
      createdAt,
    });
    await appendLog("api", "debug", "POST /api/pageview", { path: pageview.path });
    return NextResponse.json({ ok: true, id: pageview.id, visitorId, sessionId });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
