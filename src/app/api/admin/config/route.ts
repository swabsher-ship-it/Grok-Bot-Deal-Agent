import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getStore, updateStore, appendLog } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, config: (await getStore()).config });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  let config = null;
  await updateStore((store) => {
    store.config = {
      ...store.config,
      ...body,
      org: "Struxurety",
      campaign: body.campaign || store.config.campaign,
    };
    const name = String(store.config.agentName || "Alex");
    if (/^(ava|sage)$/i.test(name.trim())) {
      store.config.agentName = "Alex";
    }
    config = store.config;
  });
  await appendLog("admin", "info", "Config updated");
  return NextResponse.json({ ok: true, config });
}
