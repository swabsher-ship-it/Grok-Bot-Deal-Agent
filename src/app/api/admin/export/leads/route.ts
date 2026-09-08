import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { leadsToCsv, rangeStartISO, inRange } from "@/lib/stats";
import type { DashboardRange } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const excludeTest = searchParams.get("excludeTest") !== "false";
  const range = (searchParams.get("range") || "all") as DashboardRange;
  const start = rangeStartISO(range);
  let leads = (await getStore()).leads.filter((l) => inRange(l.createdAt, start));
  if (excludeTest) leads = leads.filter((l) => !l.isTest);
  const csv = leadsToCsv(leads);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="alex-leads.csv"',
    },
  });
}
