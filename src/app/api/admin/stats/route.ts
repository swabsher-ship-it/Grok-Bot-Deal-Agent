import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getStore, storageMode } from "@/lib/store";
import { computeDashboard } from "@/lib/stats";
import type { DashboardRange } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const excludeTest = searchParams.get("excludeTest") !== "false";
  const range = (searchParams.get("range") || "30d") as DashboardRange;
  const store = await getStore();
  const stats = computeDashboard(store, { excludeTest, range });
  return NextResponse.json({ ok: true, stats, storage: storageMode() });
}
