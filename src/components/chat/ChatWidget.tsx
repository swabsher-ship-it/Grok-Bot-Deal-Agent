"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { MessageCircle, X, Send } from "lucide-react";
import type { GateSession } from "@/lib/chat-engine";
import {
  detectDevice,
  getCachedUtm,
  getSessionId,
  getVisitorId,
  trackClient,
} from "@/lib/client/analytics";

interface Msg {
  id: string;
  role: string;
  content: string;
}

export type ChatWidgetHandle = {
  open: () => void;
};

type Phase = "idle" | "consent" | "connecting" | "chat";

const ChatWidget = forwardRef<ChatWidgetHandle, { floating?: boolean }>(
  function ChatWidget({ floating = true }, ref) {
    const [open, setOpen] = useState(!floating);
    const [phase, setPhase] = useState<Phase>(!floating ? "consent" : "idle");
    const [consentChecked, setConsentChecked] = useState(false);
    const [messages, setMessages] = useState<Msg[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [leadId, setLeadId] = useState<string | null>(null);
    const [gate, setGate] = useState<GateSession>({ step: "interest" });
    const [unlockedUrl, setUnlockedUrl] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const launcherTracked = useRef(false);

    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open, phase]);

    useEffect(() => {
      if (!floating && phase === "idle") setPhase("consent");
    }, [floating, phase]);

    function openPanel() {
      setOpen(true);
      if (!launcherTracked.current) {
        launcherTracked.current = true;
        trackClient({ type: "chat_launcher_open" });
      }
      if (phase === "idle" || (!conversationId && phase !== "connecting" && phase !== "chat")) {
        setPhase("consent");
      }
    }

    useImperativeHandle(ref, () => ({ open: openPanel }));

    async function startChat() {
      if (!consentChecked || loading) return;
      setPhase("connecting");
      setLoading(true);
      try {
        const sid = getSessionId();
        const vid = getVisitorId();
        const res = await fetch("/api/chat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sid,
            visitorId: vid,
            source: "landing_page",
            aiConsent: true,
            device: detectDevice(),
            utm: getCachedUtm(),
            path: typeof window !== "undefined" ? window.location.pathname : "/",
          }),
        });
        const data = await res.json();
        if (data.ok) {
          if (data.sessionId) {
            try {
              sessionStorage.setItem("dealagent_sid", data.sessionId);
              localStorage.setItem("dealagent_sid", data.sessionId);
            } catch {
              /* ignore */
            }
          }
          setConversationId(data.conversationId);
          setLeadId(data.leadId || null);
          setMessages(data.messages || []);
          setGate(data.gate || { step: "interest" });
          setPhase("chat");
        } else {
          setPhase("consent");
        }
      } catch {
        setPhase("consent");
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
          body: JSON.stringify({
            conversationId,
            message: text,
            gate,
            visitorId: getVisitorId(),
            sessionId: getSessionId(),
          }),
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

    const panel = (
      <div
        className={`flex flex-col overflow-hidden rounded-2xl border border-quelliv-border bg-white shadow-panel ${
          floating ? "h-[560px] w-[380px] max-w-[calc(100vw-2rem)]" : "h-[70vh] w-full max-w-2xl"
        }`}
      >
        <div className="flex items-center justify-between border-b border-quelliv-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-quelliv-cta text-sm font-semibold text-white">
              A
            </div>
            <div>
              <div className="text-[15px] font-semibold text-quelliv-navy">Alex</div>
              <div className="text-xs font-light text-quelliv-muted">Quelliv AI Assistant</div>
            </div>
          </div>
          {floating && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-quelliv-muted hover:bg-quelliv-section hover:text-quelliv-navy"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {phase === "consent" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-quelliv-cta text-quelliv-cta">
              <MessageCircle size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-quelliv-navy">
              Chat with Quelliv&apos;s AI Assistant
            </h3>
            <p className="text-sm font-light leading-relaxed text-quelliv-muted">
              This is an AI-powered assistant. By continuing, you consent to receive AI-assisted
              communications about investment opportunities from Quelliv. This is not financial
              advice. All investments carry risk.
            </p>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-quelliv-section/80 px-3 py-3 text-left text-[13px] font-light leading-snug text-quelliv-muted">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-quelliv-border accent-quelliv-cta"
              />
              <span>
                I consent to receive AI-assisted communications about investment opportunities from
                Quelliv. By continuing, I agree to the{" "}
                <Link href="/terms" className="font-medium text-quelliv-cta underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-quelliv-cta underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            <button
              type="button"
              onClick={startChat}
              disabled={!consentChecked || loading}
              className="mt-2 w-full rounded-xl bg-quelliv-cta py-3 text-sm font-medium text-white shadow-cta transition disabled:cursor-not-allowed disabled:bg-[#c5d6ff] disabled:shadow-none"
            >
              Start Chat
            </button>
          </div>
        )}

        {phase === "connecting" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="h-10 w-10 animate-pulse rounded-full bg-quelliv-cta/30" />
            <p className="text-sm font-light text-quelliv-muted">Connecting to Alex…</p>
          </div>
        )}

        {phase === "chat" && (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role !== "user" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#9aa8bc] text-[11px] font-semibold text-white">
                      A
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm font-light leading-relaxed ${
                      m.role === "user"
                        ? "bg-quelliv-cta text-white"
                        : "bg-[#EEF1F5] text-[#333333]"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {unlockedUrl && (
                <a
                  href={unlockedUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    trackClient({
                      type: "data_room_click",
                      leadId: leadId || undefined,
                      conversationId: conversationId || undefined,
                    })
                  }
                  className="ml-9 block rounded-xl border border-quelliv-cta/40 bg-quelliv-cta/10 px-3 py-2.5 text-sm font-medium text-quelliv-navy hover:bg-quelliv-cta/15"
                >
                  Open Quelliv Investor Preview / Data Room →
                </a>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-quelliv-border p-3">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message…"
                  disabled={loading}
                  className="flex-1 rounded-xl border border-[#c5d6f0] bg-white px-3.5 py-2.5 text-sm text-quelliv-navy outline-none placeholder:text-quelliv-muted/70 focus:border-quelliv-cta"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-quelliv-cta text-white disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );

    if (!floating) return panel;

    return (
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {open && panel}
        {!open && (
          <button
            type="button"
            onClick={openPanel}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-quelliv-cta text-white shadow-cta transition hover:brightness-105"
            aria-label="Chat with Alex"
          >
            <MessageCircle size={24} />
          </button>
        )}
      </div>
    );
  }
);

export default ChatWidget;
