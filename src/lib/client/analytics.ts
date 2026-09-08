"use client";

import type { AnalyticsEventType, DeviceType, UTMParams } from "@/lib/types";

const VISITOR_KEY = "dealagent_vid";
const SESSION_KEY = "dealagent_sid";
const UTM_KEY = "dealagent_utm";

function randomId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Persistent visitor cookie (~1 year). */
export function getVisitorId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|; )dealagent_vid=([^;]*)/);
  if (match?.[1]) return decodeURIComponent(match[1]);
  const fromLs = localStorage.getItem(VISITOR_KEY);
  const id = fromLs || randomId("vid");
  localStorage.setItem(VISITOR_KEY, id);
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `dealagent_vid=${encodeURIComponent(id)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  return id;
}

/** Session id — sessionStorage (clears when tab closes). */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = localStorage.getItem(SESSION_KEY) || randomId("sess");
    sessionStorage.setItem(SESSION_KEY, id);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function detectDevice(): DeviceType {
  if (typeof window === "undefined") return "Desktop";
  const w = window.innerWidth;
  if (w < 768) return "Mobile";
  if (w < 1024) return "Tablet";
  return "Desktop";
}

export function captureUtmFromSearch(
  searchParams: URLSearchParams | { get(k: string): string | null }
): UTMParams | undefined {
  const get = (k: string) => searchParams.get(k) || undefined;
  const utm: UTMParams = {
    utm_source: get("utm_source"),
    utm_medium: get("utm_medium"),
    utm_campaign: get("utm_campaign"),
    utm_content: get("utm_content"),
  };
  if (!utm.utm_source && !utm.utm_medium && !utm.utm_campaign && !utm.utm_content) {
    try {
      const cached = sessionStorage.getItem(UTM_KEY);
      if (cached) return JSON.parse(cached) as UTMParams;
    } catch {
      /* ignore */
    }
    return undefined;
  }
  try {
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  } catch {
    /* ignore */
  }
  return utm;
}

export function getCachedUtm(): UTMParams | undefined {
  try {
    const cached = sessionStorage.getItem(UTM_KEY);
    if (cached) return JSON.parse(cached) as UTMParams;
  } catch {
    /* ignore */
  }
  return undefined;
}

export type ClientTrackPayload = {
  type: AnalyticsEventType;
  path?: string;
  referrer?: string;
  device?: DeviceType;
  utm?: UTMParams;
  step?: string;
  leadId?: string;
  conversationId?: string;
  meta?: Record<string, unknown>;
};

export function trackClient(payload: ClientTrackPayload): void {
  if (typeof window === "undefined") return;
  const body = {
    ...payload,
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    path: payload.path || window.location.pathname,
    referrer: payload.referrer ?? (document.referrer || undefined),
    device: payload.device || detectDevice(),
    utm: payload.utm || getCachedUtm(),
  };
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}
