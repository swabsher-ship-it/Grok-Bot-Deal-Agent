"use client";

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
