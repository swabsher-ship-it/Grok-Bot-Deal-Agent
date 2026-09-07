import { NextRequest, NextResponse } from "next/server";
import { getStore, saveStore, appendLog } from "@/lib/store";
import { uid, nowISO, parseUTM } from "@/lib/utils";
import type { DeviceType, Region } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = getStore();
    const utm = parseUTM(body.utm || body);
    const pageview = {
      id: uid("pv"),
      path: String(body.path || "/"),
      referrer: body.referrer ? String(body.referrer) : undefined,
      device: (body.device as DeviceType) || "Desktop",
      region: (body.region as Region) || "Other",
      utm,
      sessionId: String(body.sessionId || uid("sess")),
      createdAt: nowISO(),
    };
    store.pageviews.push(pageview);
    saveStore(store);
    appendLog("api", "debug", "POST /api/pageview", { path: pageview.path });
    return NextResponse.json({ ok: true, id: pageview.id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
