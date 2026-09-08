import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getStore, updateStore, appendLog } from "@/lib/store";
import { nowISO } from "@/lib/utils";
import { rangeStartISO, inRange } from "@/lib/stats";
import type { DashboardRange } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const domain = searchParams.get("domain") || "";
  const q = (searchParams.get("q") || "").toLowerCase();
  const isTest = searchParams.get("isTest");
  const range = (searchParams.get("range") || "all") as DashboardRange;
  const start = rangeStartISO(range);

  let leads = [...(await getStore()).leads];
  leads = leads.filter((l) => inRange(l.createdAt, start));
  if (status) leads = leads.filter((l) => l.status === status);
  if (domain) leads = leads.filter((l) => l.domain === domain);
  if (isTest === "true") leads = leads.filter((l) => l.isTest);
  if (isTest === "false") leads = leads.filter((l) => !l.isTest);
  if (q) {
    leads = leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q)
    );
  }
  leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ ok: true, leads, total: leads.length });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  let lead = null;
  try {
    await updateStore((store) => {
      const found = store.leads.find((l) => l.id === body.id);
      if (!found) throw new Error("NOT_FOUND");
      if (body.status) found.status = body.status;
      if (body.state) found.state = body.state;
      if (typeof body.isTest === "boolean") found.isTest = body.isTest;
      found.updatedAt = nowISO();
      lead = found;
    });
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    throw e;
  }
  await appendLog("admin", "info", "Lead updated", { id: body.id });
  return NextResponse.json({ ok: true, lead });
}
