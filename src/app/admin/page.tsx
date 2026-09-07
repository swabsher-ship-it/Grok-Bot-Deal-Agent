import { redirect } from "next/navigation";
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
