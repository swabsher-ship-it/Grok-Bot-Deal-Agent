import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function uid(prefix = ""): string {
  const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}_${id}` : id;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function parseUTM(searchParams: URLSearchParams | Record<string, string | undefined>) {
  const get = (k: string) => {
    if (searchParams instanceof URLSearchParams) return searchParams.get(k) || undefined;
    return searchParams[k] || undefined;
  };
  const utm = {
    utm_source: get("utm_source"),
    utm_medium: get("utm_medium"),
    utm_campaign: get("utm_campaign"),
    utm_content: get("utm_content"),
  };
  if (!utm.utm_source && !utm.utm_medium && !utm.utm_campaign && !utm.utm_content) {
    return undefined;
  }
  return utm;
}

export function sourceLabel(source: string): string {
  switch (source) {
    case "landing_page":
      return "Landing page";
    case "x":
      return "X";
    case "email":
      return "Email";
    case "direct":
      return "Direct";
    default:
      return source;
  }
}

export function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US");
}
