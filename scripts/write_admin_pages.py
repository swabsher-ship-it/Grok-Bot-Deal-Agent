from pathlib import Path

ROOT = Path(".")

files = {}

files["src/components/admin/DashboardCharts.tsx"] = r'''"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

const COLORS = ["#22c55e", "#8b5cf6", "#3b82f6", "#eab308", "#64748b", "#ef4444"];

function toBars(obj: Record<string, number>) {
  return Object.entries(obj).map(([name, value]) => ({ name, value }));
}

export default function DashboardCharts({
  sourceCounts,
  deviceCounts,
  regionCounts,
  statusCounts,
  campaignCounts,
  contentCounts,
  last7,
  avgMsgs,
}: {
  sourceCounts: Record<string, number>;
  deviceCounts: Record<string, number>;
  regionCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  campaignCounts: Record<string, number>;
  contentCounts: Record<string, number>;
  last7: { day: string; count: number }[];
  avgMsgs: number;
}) {
  const devices = toBars(deviceCounts);
  const regions = toBars(regionCounts);
  const sources = toBars(sourceCounts);
  const statuses = toBars(statusCounts);
  const campaigns = toBars(campaignCounts);
  const content = toBars(contentCounts);
  const deviceTotal = devices.reduce((a, b) => a + b.value, 0);
  const regionTotal = regions.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="card">
          <h3 className="mb-3 text-sm font-medium text-deal-muted">Lead Sources</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sources} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={90} tick={{ fill: "#8b95b0", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#161b2c", border: "1px solid #1e2540" }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-3 text-sm font-medium text-deal-muted">Device Types</h3>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={devices} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70}>
                  {devices.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#161b2c", border: "1px solid #1e2540" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-deal-muted">
              {deviceTotal} total
            </div>
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-deal-muted">
            {devices.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-3 text-sm font-medium text-deal-muted">Top Campaigns</h3>
          {campaigns.length === 0 ? (
            <p className="text-sm text-deal-muted">No campaign UTM data yet.</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaigns} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#8b95b0", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#161b2c", border: "1px solid #1e2540" }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="mb-3 text-sm font-medium text-deal-muted">Top Content</h3>
          {content.length === 0 ? (
            <p className="text-sm text-deal-muted">
              No UTM content data yet. Add ?utm_content=... to your links.
            </p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={content} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#8b95b0", fontSize: 11 }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="mb-3 text-sm font-medium text-deal-muted">Leads Last 7 Days</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7}>
                <CartesianGrid stroke="#1e2540" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: "#8b95b0", fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: "#8b95b0", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#161b2c", border: "1px solid #1e2540" }} />
                <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-3 text-sm font-medium text-deal-muted">Leads by Region</h3>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={regions} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70}>
                  {regions.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#161b2c", border: "1px solid #1e2540" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-deal-muted">
              {regionTotal} total
            </div>
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-deal-muted">
            {regions.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-3 text-sm font-medium text-deal-muted">Leads by Status</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statuses} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#8b95b0", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#161b2c", border: "1px solid #1e2540" }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {statuses.map((s, i) => {
                  const color =
                    s.name === "Docs Sent"
                      ? "#22c55e"
                      : s.name === "Opted Out"
                        ? "#ef4444"
                        : s.name === "Engaged"
                          ? "#3b82f6"
                          : "#64748b";
                  return <Cell key={i} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-deal-muted">Avg messages/conversation: {avgMsgs}</p>
      </div>
    </div>
  );
}
'''

files["src/app/admin/page.tsx"] = r'''import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { computeDashboard } from "@/lib/stats";
import DashboardCharts from "@/components/admin/DashboardCharts";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const store = getStore();
  const stats = computeDashboard(store);

  const kpis = [
    { label: "Total Leads", value: stats.totalLeads, className: "text-white" },
    { label: "Docs Sent", value: stats.docsSent, className: "text-deal-green" },
    { label: "Opted Out", value: stats.optedOut, className: "text-deal-red" },
    {
      label: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      className: "text-deal-accent",
      sub: stats.conversionLabel,
    },
    { label: "Leads Today", value: stats.leadsToday, className: "text-white" },
    {
      label: "Deliveries",
      value: stats.deliveries,
      className: "text-deal-green",
      sub: `${stats.stuck} stuck`,
    },
  ];

  const funnel = [
    { label: "Pageviews", value: stats.funnel.pageviews },
    { label: "Chat starts", value: stats.funnel.chatStarts },
    { label: "Leads", value: stats.funnel.leads },
    { label: "Docs Sent", value: stats.funnel.docsSent },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-deal-muted">
          {stats.campaign} campaign overview · {stats.org}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="card">
            <div className="text-xs uppercase tracking-wide text-deal-muted">{k.label}</div>
            <div className={`mt-1 text-3xl font-semibold ${k.className}`}>{k.value}</div>
            {"sub" in k && k.sub ? <div className="mt-1 text-xs text-deal-muted">{k.sub}</div> : null}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="mb-3 text-sm font-medium text-deal-muted">
          Funnel · Pageviews → Chat starts → Leads → Docs Sent
        </h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {funnel.map((f) => (
            <div key={f.label} className="rounded-lg bg-[#0f1322] p-3">
              <div className="text-xs text-deal-muted">{f.label}</div>
              <div className="text-2xl font-semibold text-white">{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card border-amber-500/30 bg-amber-500/5">
        <h3 className="text-sm font-medium text-amber-200">A2P / SMS outbound</h3>
        <p className="mt-1 text-xs text-deal-muted">
          Brand: {store.config.a2pBrandStatus} · Campaign {store.config.a2pCampaignSid}:{" "}
          {store.config.a2pCampaignStatus} · SMS_OUTBOUND_ENABLED=
          {String(store.config.SMS_OUTBOUND_ENABLED)} · MS {store.config.a2pMessagingServiceSid}
        </p>
        <p className="mt-1 text-xs text-deal-muted">{store.config.voiceDidPoolNote}</p>
      </div>

      <DashboardCharts
        sourceCounts={stats.sourceCounts}
        deviceCounts={stats.deviceCounts}
        regionCounts={stats.regionCounts}
        statusCounts={stats.statusCounts}
        campaignCounts={stats.campaignCounts}
        contentCounts={stats.contentCounts}
        last7={stats.last7}
        avgMsgs={stats.avgMsgs}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 text-sm font-medium text-deal-muted">Recent Leads</h3>
          <ul className="space-y-3">
            {stats.recentLeads.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white">{l.name}</span>
                  <StatusBadge status={l.status} />
                  {l.isTest ? <span className="badge bg-amber-500/20 text-amber-200">test</span> : null}
                </div>
                <span className="text-xs text-deal-muted">{formatRelative(l.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3 className="mb-3 text-sm font-medium text-deal-muted">Recent Deliveries</h3>
          <ul className="space-y-3">
            {stats.recentDeliveries.map((d) => (
              <li key={d.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge ${
                        d.channel === "EMAIL" ? "bg-blue-500/20 text-blue-300" : "bg-green-500/20 text-green-300"
                      }`}
                    >
                      [{d.channel}]
                    </span>
                    <span className="text-white">{d.leadName}</span>
                  </div>
                  <span className="text-xs text-deal-muted">{formatRelative(d.createdAt)}</span>
                </div>
                <div className="mt-1 text-xs text-deal-muted">To: {d.to}</div>
                <div className="text-xs text-deal-muted">Subject: {d.subject}</div>
                <div className="truncate text-xs text-slate-400">{d.preview}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
'''

files["src/app/admin/leads/page.tsx"] = r'''"use client";

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
  const [isTest, setIsTest] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (domain) params.set("domain", domain);
    if (q) params.set("q", q);
    if (isTest) params.set("isTest", isTest);
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
  }, [status, domain, isTest]);

  const domains = Array.from(new Set(leads.map((l) => l.domain).filter(Boolean))).sort();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Leads</h1>
        <p className="text-sm text-deal-muted">Quelliv campaign · filter by status, domain, search</p>
      </div>

      <div className="flex flex-wrap gap-2">
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
              {["Name", "Email", "Phone", "Status", "State", "Source", "Domain", "Created"].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-deal-muted">
                  Loading…
                </td>
              </tr>
            ) : (
              leads.map((l) => (
                <tr key={l.id} className="border-b border-deal-border/60">
                  <td className="px-3 py-2 text-white">
                    {l.name}
                    {l.isTest ? <span className="ml-2 badge bg-amber-500/20 text-amber-200">test</span> : null}
                  </td>
                  <td className="px-3 py-2 text-deal-muted">{l.email || "—"}</td>
                  <td className="px-3 py-2 text-deal-muted">{l.phone || "—"}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-3 py-2 text-deal-muted">{l.state}</td>
                  <td className="px-3 py-2 text-deal-muted">{sourceLabel(l.source)}</td>
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
'''

print("writing batch 1...")
for path, content in files.items():
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content)
    print("wrote", path)
print("done batch 1")
