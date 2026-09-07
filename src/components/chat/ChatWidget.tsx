"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import type { GateSession } from "@/lib/chat-engine";

interface Msg {
  id: string;
  role: string;
  content: string;
}

export default function ChatWidget({ floating = true }: { floating?: boolean }) {
  const [open, setOpen] = useState(!floating);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [gate, setGate] = useState<GateSession>({ step: "consent" });
  const [unlockedUrl, setUnlockedUrl] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function startChat() {
    setLoading(true);
    try {
      const sid = localStorage.getItem("dealagent_sid") || undefined;
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, source: "landing_page" }),
      });
      const data = await res.json();
      if (data.ok) {
        setConversationId(data.conversationId);
        setMessages(data.messages || []);
        setGate(data.gate || { step: "consent" });
      }
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    if (!input.trim() || !conversationId || loading) return;
    const text = input.trim();
    setInput("");
    setLoading(true);
    setMessages((m) => [...m, { id: `local_${Date.now()}`, role: "user", content: text }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: text, gate }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessages(data.messages || []);
        setGate(data.gate || gate);
        if (data.unlocked && data.dataRoomUrl) setUnlockedUrl(data.dataRoomUrl);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    if (!conversationId) startChat();
  }

  const panel = (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-deal-border bg-deal-card shadow-2xl ${
        floating ? "h-[520px] w-[380px]" : "h-[70vh] w-full max-w-2xl"
      }`}
    >
      <div className="flex items-center justify-between border-b border-deal-border bg-[#12172a] px-4 py-3">
        <div>
          <div className="font-semibold text-white">Alex · Deal Agent</div>
          <div className="text-xs text-deal-muted">Quelliv Investor Data Room</div>
        </div>
        {floating && (
          <button onClick={() => setOpen(false)} className="text-deal-muted hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {!conversationId && (
          <div className="rounded-lg bg-[#1a2035] p-3 text-sm text-deal-muted">
            Start a conversation with Alex to begin the access gate (consent → identity → unlock).
            <button
              onClick={startChat}
              disabled={loading}
              className="mt-3 block w-full rounded-lg bg-deal-accent px-3 py-2 text-sm font-medium text-white hover:bg-violet-500"
            >
              {loading ? "Starting…" : "Start Chat"}
            </button>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-deal-accent text-white"
                : "bg-[#1a2035] text-slate-100"
            }`}
          >
            {m.content}
          </div>
        ))}
        {unlockedUrl && (
          <a
            href={unlockedUrl}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg border border-deal-green/40 bg-deal-green/10 px-3 py-2 text-sm text-deal-green"
          >
            Open Investor Data Room →
          </a>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-deal-border p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={conversationId ? "Type a message…" : "Start chat first"}
            disabled={!conversationId || loading}
            className="flex-1 rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm outline-none focus:border-deal-accent"
          />
          <button
            onClick={send}
            disabled={!conversationId || loading}
            className="rounded-lg bg-deal-accent px-3 py-2 text-white disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-deal-muted">
          Informational only — not an offer to buy or sell securities. Alex will not invent returns.
        </p>
      </div>
    </div>
  );

  if (!floating) return panel;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && panel}
      {!open && (
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 rounded-full bg-deal-accent px-4 py-3 font-medium text-white shadow-lg hover:bg-violet-500"
        >
          <MessageCircle size={18} />
          Chat with Alex
        </button>
      )}
    </div>
  );
}
