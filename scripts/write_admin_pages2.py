from pathlib import Path
ROOT = Path(".")
files = {}

files["src/app/admin/conversations/page.tsx"] = r'''"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Conversation } from "@/lib/types";

const FILTERS = ["All", "Escalated", "AI Active", "Admin", "Resolved"];

export default function ConversationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Conversation[]>([]);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [reply, setReply] = useState("");

  async function load() {
    const params = new URLSearchParams({ filter, q });
    const res = await fetch(`/api/admin/conversations?${params}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setItems(data.conversations || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function act(id: string, action: string, message?: string) {
    const res = await fetch("/api/admin/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, message }),
    });
    const data = await res.json();
    if (data.ok) {
      setSelected(data.conversation);
      load();
      setReply("");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Conversations</h1>
        <p className="text-sm text-deal-muted">Take Over · Resolve · admin reply</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              filter === f ? "bg-deal-accent text-white" : "bg-[#12172a] text-deal-muted"
            }`}
          >
            {f}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search name / phone"
          className="rounded-lg border border-deal-border bg-[#0f1322] px-3 py-1.5 text-sm"
        />
        <button onClick={load} className="rounded-lg border border-deal-border px-3 text-sm text-deal-muted">
          Search
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-2 p-2">
          {items.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`w-full rounded-lg px-3 py-2 text-left hover:bg-[#1a2035] ${
                selected?.id === c.id ? "bg-[#1a2035]" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{c.leadName}</span>
                <span className="text-xs text-deal-muted">{c.mode}</span>
              </div>
              <div className="text-xs text-deal-muted">
                {c.leadPhone || "no phone"} · {c.messages.length} msg
              </div>
            </button>
          ))}
          {items.length === 0 && <p className="p-3 text-sm text-deal-muted">No conversations</p>}
        </div>

        <div className="card flex min-h-[420px] flex-col">
          {!selected ? (
            <p className="text-sm text-deal-muted">Select a conversation</p>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-white">{selected.leadName}</div>
                  <div className="text-xs text-deal-muted">{selected.mode}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => act(selected.id, "takeover")}
                    className="rounded-lg bg-deal-blue/20 px-3 py-1.5 text-xs text-blue-300"
                  >
                    Take Over
                  </button>
                  <button
                    onClick={() => act(selected.id, "resolve")}
                    className="rounded-lg bg-deal-green/20 px-3 py-1.5 text-xs text-green-300"
                  >
                    Resolve
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto">
                {selected.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[90%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "ml-auto bg-deal-accent/80"
                        : m.role === "admin"
                          ? "bg-blue-600/30"
                          : "bg-[#1a2035]"
                    }`}
                  >
                    <div className="mb-1 text-[10px] uppercase text-deal-muted">{m.role}</div>
                    {m.content}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Admin reply…"
                  className="flex-1 rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm"
                />
                <button
                  onClick={() => reply.trim() && act(selected.id, "reply", reply.trim())}
                  className="rounded-lg bg-deal-accent px-3 py-2 text-sm text-white"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
'''

files["src/app/admin/logs/page.tsx"] = r'''"use client";

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
'''

files["src/app/admin/users/page.tsx"] = r'''"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("change-me");

  async function load() {
    const res = await fetch("/api/admin/users");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setUsers(data.users || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", name, email, password }),
    });
    setName("");
    setEmail("");
    load();
  }

  async function toggleActive(u: SafeUser) {
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id: u.id, active: !u.active }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-sm text-deal-muted">Add / Edit / Activate admins</p>
      </div>

      <form onSubmit={createUser} className="card grid gap-3 md:grid-cols-4">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-deal-accent px-3 py-2 text-sm text-white">
          Add admin
        </button>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="border-b border-deal-border text-xs uppercase text-deal-muted">
            <tr>
              {["Name", "Email", "Role", "Status", "Created", ""].map((h) => (
                <th key={h || "a"} className="px-3 py-3 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-deal-border/50">
                <td className="px-3 py-2 text-white">{u.name}</td>
                <td className="px-3 py-2 text-deal-muted">{u.email}</td>
                <td className="px-3 py-2 text-deal-muted">{u.role}</td>
                <td className="px-3 py-2">
                  <span className={`badge ${u.active ? "bg-green-500/20 text-green-300" : "bg-slate-500/20 text-slate-300"}`}>
                    {u.active ? "active" : "inactive"}
                  </span>
                </td>
                <td className="px-3 py-2 text-deal-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2">
                  <button onClick={() => toggleActive(u)} className="text-xs text-deal-accent hover:underline">
                    {u.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
'''

for path, content in files.items():
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content)
    print("wrote", path)
