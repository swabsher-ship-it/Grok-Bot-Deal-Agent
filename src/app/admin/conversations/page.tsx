"use client";

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
