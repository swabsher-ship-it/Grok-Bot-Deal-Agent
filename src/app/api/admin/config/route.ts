import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getStore, saveStore, appendLog } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, config: getStore().config });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const store = getStore();
  store.config = { ...store.config, ...body, org: "Struxurety", campaign: body.campaign || store.config.campaign };
  // Keep agent name Alex unless explicitly set — never Ava/SAGE
  const name = String(store.config.agentName || "Alex");
  if (/^(ava|sage)$/i.test(name.trim())) {
    store.config.agentName = "Alex";
  }
  saveStore(store);
  appendLog("admin", "info", "Config updated");
  return NextResponse.json({ ok: true, config: store.config });
}
