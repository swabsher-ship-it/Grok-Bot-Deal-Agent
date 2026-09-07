import type { StoreData } from "./types";
import { sourceLabel, startOfTodayISO } from "./utils";

export function computeDashboard(store: StoreData) {
  const leads = store.leads;
  const totalLeads = leads.length;
  const docsSent = leads.filter((l) => l.status === "Docs Sent").length;
  const optedOut = leads.filter((l) => l.status === "Opted Out").length;
  const today = startOfTodayISO();
  const leadsToday = leads.filter((l) => l.createdAt >= today).length;
  const deliveries = store.deliveries.filter((d) => d.status === "sent").length;
  const stuck = store.deliveries.filter((d) => d.status === "stuck").length;
  const aiActive = store.conversations.filter((c) => c.mode === "AI Active").length;
  const conversionRate = totalLeads ? (aiActive / totalLeads) * 100 : 0;

  const sourceCounts: Record<string, number> = {};
  for (const l of leads) {
    const label = sourceLabel(l.source);
    sourceCounts[label] = (sourceCounts[label] || 0) + 1;
  }

  const deviceCounts: Record<string, number> = {};
  for (const l of leads) {
    deviceCounts[l.device] = (deviceCounts[l.device] || 0) + 1;
  }

  const regionCounts: Record<string, number> = {};
  for (const l of leads) {
    regionCounts[l.region] = (regionCounts[l.region] || 0) + 1;
  }

  const statusCounts: Record<string, number> = {};
  for (const l of leads) {
    statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
  }

  const campaignCounts: Record<string, number> = {};
  const contentCounts: Record<string, number> = {};
  for (const l of leads) {
    const c = l.utm?.utm_campaign;
    if (c) campaignCounts[c] = (campaignCounts[c] || 0) + 1;
    const ct = l.utm?.utm_content;
    if (ct) contentCounts[ct] = (contentCounts[ct] || 0) + 1;
  }

  const last7: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const count = leads.filter((l) => {
      const t = new Date(l.createdAt).getTime();
      return t >= d.getTime() && t < next.getTime();
    }).length;
    last7.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      count,
    });
  }

  const msgCounts = store.conversations.map((c) => c.messages.length);
  const avgMsgs =
    msgCounts.length > 0 ? msgCounts.reduce((a, b) => a + b, 0) / msgCounts.length : 0;

  const funnel = {
    pageviews: store.pageviews.length,
    chatStarts: store.chatStarts.length,
    leads: totalLeads,
    docsSent,
  };

  const recentLeads = [...leads]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);
  const recentDeliveries = [...store.deliveries]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  return {
    totalLeads,
    docsSent,
    optedOut,
    leadsToday,
    deliveries,
    stuck,
    conversionRate: Math.round(conversionRate * 10) / 10,
    conversionLabel: "AI Active / Total Leads",
    aiActive,
    sourceCounts,
    deviceCounts,
    regionCounts,
    statusCounts,
    campaignCounts,
    contentCounts,
    last7,
    avgMsgs: Math.round(avgMsgs * 10) / 10,
    funnel,
    recentLeads,
    recentDeliveries,
    org: store.config.org,
    campaign: store.config.campaign,
  };
}
