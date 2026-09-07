"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { LogEntry } from "@/lib/types";

const CATEGORIES = ["", "chat", "sms", "email", "voice", "system", "admin", "api"];
const SEVERITIES = ["", "error", "warn", "info", "debug"];
const RANGES = ["15m", "1h", "6h", "24h", "7d"];

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [range, setRange] = useState("7d");
  const [q, setQ] = useState("");
  const [live, setLive] = useState(false);
  const [limit, setLimit] = useState(100);

  async function load() {
    const params = new URLSearchParams({ range, limit: String(limit) });
    if (category) params.set("category", category);
    if (severity) params.set("severity", severity);
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/logs?${params}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setLogs(data.logs || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, severity, range, limit]);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, category, severity, range, limit, q]);

  function exportJson() {
    const params = new URLSearchParams({ range, export: "json", limit: "2000" });
    if (category) params.set("category", category);
    if (severity) params.set("severity", severity);
    if (q) params.set("q", q);
    window.open(`/api/admin/logs?${params}`, "_blank");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Logs</h1>
          <p className="text-sm text-deal-muted">Categories · severity · live · export JSON</p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-sm text-deal-muted">
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
            Live
          </label>
          <button onClick={exportJson} className="rounded-lg border border-deal-border px-3 py-1.5 text-sm">
            Export JSON
          </button>
          <button
            onClick={() => setLimit((n) => n + 100)}
            className="rounded-lg border border-deal-border px-3 py-1.5 text-sm"
          >
            Load more
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm">
          <option value="">All categories</option>
          {CATEGORIES.filter(Boolean).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm">
          <option value="">All severity</option>
          {SEVERITIES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={range} onChange={(e) => setRange(e.target.value)} className="rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm">
          {RANGES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search"
          className="rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm"
        />
        <button onClick={load} className="rounded-lg bg-deal-accent px-3 py-2 text-sm text-white">
          Search
        </button>
      </div>

      <div className="card space-y-2 p-3 font-mono text-xs">
        {logs.map((l) => (
          <div key={l.id} className="border-b border-deal-border/40 pb-2">
            <span className="text-deal-muted">{new Date(l.createdAt).toLocaleString()}</span>{" "}
            <span className="text-deal-accent">[{l.category}]</span>{" "}
            <span className={l.severity === "error" ? "text-deal-red" : l.severity === "warn" ? "text-amber-300" : "text-slate-300"}>
              {l.severity}
            </span>{" "}
            <span className="text-white">{l.message}</span>
          </div>
        ))}
        {logs.length === 0 && <p className="text-deal-muted">No logs in range</p>}
      </div>
    </div>
  );
}
