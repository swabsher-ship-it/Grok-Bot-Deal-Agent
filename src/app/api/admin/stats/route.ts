import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { computeDashboard } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const stats = computeDashboard(getStore());
  return NextResponse.json({ ok: true, stats });
}
