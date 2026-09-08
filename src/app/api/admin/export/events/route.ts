import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { eventsToCsv, rangeStartISO, inRange } from "@/lib/stats";
import type { DashboardRange } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const range = (searchParams.get("range") || "all") as DashboardRange;
  const start = rangeStartISO(range);
  const events = ((await getStore()).events || []).filter((e) => inRange(e.createdAt, start));
  const csv = eventsToCsv(events);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="alex-events.csv"',
    },
  });
}
