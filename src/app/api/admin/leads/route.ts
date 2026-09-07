import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getStore, saveStore, appendLog } from "@/lib/store";
import { nowISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const domain = searchParams.get("domain") || "";
  const q = (searchParams.get("q") || "").toLowerCase();
  const isTest = searchParams.get("isTest");

  let leads = [...getStore().leads];
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
  const store = getStore();
  const lead = store.leads.find((l) => l.id === body.id);
  if (!lead) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (body.status) lead.status = body.status;
  if (body.state) lead.state = body.state;
  if (typeof body.isTest === "boolean") lead.isTest = body.isTest;
  lead.updatedAt = nowISO();
  saveStore(store);
  appendLog("admin", "info", "Lead updated", { id: lead.id });
  return NextResponse.json({ ok: true, lead });
}
