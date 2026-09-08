import type { AnalyticsEvent, DashboardRange, StoreData } from "./types";
import { sourceLabel, startOfTodayISO } from "./utils";

export interface DashboardOpts {
  excludeTest?: boolean;
  range?: DashboardRange;
}

function rangeStartISO(range: DashboardRange): string | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : 30;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (days - 1));
  return d.toISOString();
}

function inRange(iso: string, start: string | null): boolean {
  if (!start) return true;
  return iso >= start;
}

function rate(num: number, den: number): number {
  if (!den) return 0;
  return Math.round((num / den) * 1000) / 10;
}

export function computeDashboard(store: StoreData, opts: DashboardOpts = {}) {
  const excludeTest = opts.excludeTest !== false; // default ON
  const range: DashboardRange = opts.range || "30d";
  const start = rangeStartISO(range);

  let leads = store.leads.filter((l) => inRange(l.createdAt, start));
  if (excludeTest) leads = leads.filter((l) => !l.isTest);

  const leadIds = new Set(leads.map((l) => l.id));

  const totalLeads = leads.length;
  const docsSent = leads.filter((l) => l.status === "Docs Sent" || l.status === "Doc Viewed").length;
  const optedOut = leads.filter((l) => l.status === "Opted Out").length;
  const today = startOfTodayISO();
  const leadsToday = leads.filter((l) => l.createdAt >= today).length;

  const deliveriesAll = store.deliveries.filter((d) => inRange(d.createdAt, start));
  const deliveries = deliveriesAll.filter((d) => {
    if (d.status !== "sent") return false;
    if (!excludeTest) return true;
    const lead = store.leads.find((l) => l.id === d.leadId);
    return lead ? !lead.isTest : true;
  }).length;
  const stuck = deliveriesAll.filter((d) => d.status === "stuck").length;

  const conversations = store.conversations.filter((c) => {
    if (!inRange(c.createdAt, start)) return false;
    if (!excludeTest) return true;
    return leadIds.has(c.leadId) || !store.leads.find((l) => l.id === c.leadId)?.isTest;
  });
  const aiActive = conversations.filter((c) => c.mode === "AI Active").length;
  const conversionRate = totalLeads ? (aiActive / totalLeads) * 100 : 0;
  const docsSentRate = totalLeads ? (docsSent / totalLeads) * 100 : 0;

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

  const pageviews = (store.pageviews || []).filter((p) => inRange(p.createdAt, start));
  const events = (store.events || []).filter((e) => inRange(e.createdAt, start));
  const chatStarts = (store.chatStarts || []).filter((c) => inRange(c.createdAt, start));

  const pageviewsBySource: Record<string, number> = {};
  for (const p of pageviews) {
    const src = p.utm?.utm_source || (p.referrer ? "referral" : "direct");
    pageviewsBySource[src] = (pageviewsBySource[src] || 0) + 1;
  }
  const pageviewsByCampaign: Record<string, number> = {};
  for (const p of pageviews) {
    const c = p.utm?.utm_campaign;
    if (c) pageviewsByCampaign[c] = (pageviewsByCampaign[c] || 0) + 1;
  }

  const chartDays = range === "7d" ? 7 : range === "30d" ? 30 : 14;
  const lastN: { day: string; count: number; pageviews: number }[] = [];
  for (let i = chartDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const count = leads.filter((l) => {
      const t = new Date(l.createdAt).getTime();
      return t >= d.getTime() && t < next.getTime();
    }).length;
    const pv = pageviews.filter((p) => {
      const t = new Date(p.createdAt).getTime();
      return t >= d.getTime() && t < next.getTime();
    }).length;
    lastN.push({
      day:
        chartDays <= 7
          ? d.toLocaleDateString("en-US", { weekday: "short" })
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count,
      pageviews: pv,
    });
  }

  const msgCounts = conversations.map((c) => c.messages.length);
  const avgMsgs =
    msgCounts.length > 0 ? msgCounts.reduce((a, b) => a + b, 0) / msgCounts.length : 0;

  const funnelPageviews = pageviews.length || events.filter((e) => e.type === "pageview").length;
  const funnelChatStarts =
    chatStarts.length || events.filter((e) => e.type === "chat_start").length;
  const funnelLeads = totalLeads;
  const funnelDocsSent = docsSent;

  const funnel = {
    pageviews: funnelPageviews,
    chatStarts: funnelChatStarts,
    leads: funnelLeads,
    docsSent: funnelDocsSent,
    rates: {
      pageviewToChat: rate(funnelChatStarts, funnelPageviews),
      chatToLead: rate(funnelLeads, funnelChatStarts),
      leadToDocs: rate(funnelDocsSent, funnelLeads),
      pageviewToDocs: rate(funnelDocsSent, funnelPageviews),
    },
  };

  const eventCounts: Record<string, number> = {};
  for (const e of events) {
    eventCounts[e.type] = (eventCounts[e.type] || 0) + 1;
  }

  const recentLeads = [...leads]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);
  const recentDeliveries = [...store.deliveries]
    .filter((d) => inRange(d.createdAt, start))
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
    docsSentConversionRate: Math.round(docsSentRate * 10) / 10,
    docsSentConversionLabel: "Docs Sent / Leads",
    aiActive,
    sourceCounts,
    deviceCounts,
    regionCounts,
    statusCounts,
    campaignCounts,
    contentCounts,
    pageviewsBySource,
    pageviewsByCampaign,
    last7: lastN,
    avgMsgs: Math.round(avgMsgs * 10) / 10,
    funnel,
    eventCounts,
    recentLeads,
    recentDeliveries,
    org: store.config.org,
    campaign: store.config.campaign,
    excludeTest,
    range,
  };
}

export function eventsToCsv(events: AnalyticsEvent[]): string {
  const headers = [
    "id",
    "type",
    "createdAt",
    "visitorId",
    "sessionId",
    "path",
    "referrer",
    "device",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "step",
    "leadId",
    "conversationId",
  ];
  const rows = events.map((e) =>
    [
      e.id,
      e.type,
      e.createdAt,
      e.visitorId || "",
      e.sessionId || "",
      e.path || "",
      e.referrer || "",
      e.device || "",
      e.utm?.utm_source || "",
      e.utm?.utm_medium || "",
      e.utm?.utm_campaign || "",
      e.utm?.utm_content || "",
      e.step || "",
      e.leadId || "",
      e.conversationId || "",
    ]
      .map(csvEscape)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export function leadsToCsv(leads: StoreData["leads"]): string {
  const headers = [
    "id",
    "name",
    "email",
    "phone",
    "status",
    "state",
    "source",
    "domain",
    "device",
    "region",
    "isTest",
    "createdAt",
    "updatedAt",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "visitorId",
    "sessionId",
  ];
  const rows = leads.map((l) =>
    [
      l.id,
      l.name,
      l.email,
      l.phone,
      l.status,
      l.state,
      l.source,
      l.domain,
      l.device,
      l.region,
      String(l.isTest),
      l.createdAt,
      l.updatedAt,
      l.utm?.utm_source || "",
      l.utm?.utm_medium || "",
      l.utm?.utm_campaign || "",
      l.utm?.utm_content || "",
      l.visitorId || "",
      l.sessionId || "",
    ]
      .map(csvEscape)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

function csvEscape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export { rangeStartISO, inRange };
