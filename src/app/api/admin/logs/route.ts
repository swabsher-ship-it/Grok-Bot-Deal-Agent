import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "";
  const severity = searchParams.get("severity") || "";
  const q = (searchParams.get("q") || "").toLowerCase();
  const range = searchParams.get("range") || "7d";
  const limit = Number(searchParams.get("limit") || 100);

  const rangeMs: Record<string, number> = {
    "15m": 15 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "6h": 6 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
  };
  const since = Date.now() - (rangeMs[range] || rangeMs["7d"]);

  let logs = getStore().logs.filter((l) => new Date(l.createdAt).getTime() >= since);
  if (category) logs = logs.filter((l) => l.category === category);
  if (severity) logs = logs.filter((l) => l.severity === severity);
  if (q) logs = logs.filter((l) => l.message.toLowerCase().includes(q));
  logs = logs.slice(0, limit);

  if (searchParams.get("export") === "json") {
    return new NextResponse(JSON.stringify(logs, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="dealagent-logs.json"',
      },
    });
  }

  return NextResponse.json({ ok: true, logs, total: logs.length });
}
