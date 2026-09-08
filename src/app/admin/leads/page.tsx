"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import { sourceLabel } from "@/lib/utils";
import type { Lead } from "@/lib/types";

const STATUSES = [
  "",
  "New",
  "Engaged",
  "Info Collected",
  "Docs Sent",
  "Doc Viewed",
  "Meeting Booked",
  "Handed Off",
  "Opted Out",
  "Closed",
];

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState("");
  const [domain, setDomain] = useState("");
  const [q, setQ] = useState("");
  const [isTest, setIsTest] = useState("false");
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (domain) params.set("domain", domain);
    if (q) params.set("q", q);
    if (isTest) params.set("isTest", isTest);
    if (range) params.set("range", range);
    const res = await fetch(`/api/admin/leads?${params}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setLeads(data.leads || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, domain, isTest, range]);

  const domains = Array.from(new Set(leads.map((l) => l.domain).filter(Boolean))).sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-sm text-deal-muted">
            Quelliv campaign · UTM + test badge · date filter
          </p>
        </div>
        <a
          href={`/api/admin/export/leads?excludeTest=${isTest === "false"}&range=${range}`}
          className="rounded-lg border border-deal-border px-3 py-2 text-sm text-deal-muted hover:text-white"
        >
          Export CSV
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm"
        >
          <option value="">All domains</option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={isTest}
          onChange={(e) => setIsTest(e.target.value)}
          className="rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm"
        >
          <option value="">Test + real</option>
          <option value="false">Real only</option>
          <option value="true">Test only</option>
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search name / email / phone"
          className="min-w-[220px] flex-1 rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm"
        />
        <button onClick={load} className="rounded-lg bg-deal-accent px-3 py-2 text-sm text-white">
          Search
        </button>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deal-border text-xs uppercase text-deal-muted">
            <tr>
              {[
                "Name",
                "Email",
                "Phone",
                "Status",
                "Source",
                "utm_source",
                "utm_medium",
                "utm_campaign",
                "utm_content",
                "Domain",
                "Created",
              ].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="px-3 py-6 text-deal-muted">
                  Loading…
                </td>
              </tr>
            ) : (
              leads.map((l) => (
                <tr key={l.id} className="border-b border-deal-border/60">
                  <td className="px-3 py-2 text-white">
                    {l.name}
                    {l.isTest ? (
                      <span className="ml-2 badge bg-amber-500/20 text-amber-200">test</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-deal-muted">{l.email || "—"}</td>
                  <td className="px-3 py-2 text-deal-muted">{l.phone || "—"}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-3 py-2 text-deal-muted">{sourceLabel(l.source)}</td>
                  <td className="px-3 py-2 text-deal-muted">{l.utm?.utm_source || "—"}</td>
                  <td className="px-3 py-2 text-deal-muted">{l.utm?.utm_medium || "—"}</td>
                  <td className="px-3 py-2 text-deal-muted">{l.utm?.utm_campaign || "—"}</td>
                  <td className="px-3 py-2 text-deal-muted">{l.utm?.utm_content || "—"}</td>
                  <td className="px-3 py-2 text-deal-muted">{l.domain || "—"}</td>
                  <td className="px-3 py-2 text-deal-muted">
                    {new Date(l.createdAt).toLocaleDateString("en-US")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-deal-muted">{leads.length} leads</p>
    </div>
  );
}
