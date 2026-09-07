import Link from "next/link";
import { Suspense } from "react";
import PageviewTracker from "@/components/landing/PageviewTracker";
import ChatWidget from "@/components/chat/ChatWidget";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function StartPage() {
  const { config } = getStore();

  return (
    <main className="min-h-screen bg-deal-bg">
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      <header className="border-b border-deal-border/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm text-deal-muted hover:text-white">
            ← Quelliv
          </Link>
          <div className="text-sm font-medium text-white">
            {config.agentName} · Access Gate
          </div>
          <Link href="/admin" className="text-sm text-deal-muted hover:text-white">
            Admin
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-10">
        <div className="w-full text-center">
          <h1 className="text-3xl font-bold text-white">Start with {config.agentName}</h1>
          <p className="mt-2 text-deal-muted">
            Consent → name → email → phone → SMS consent → confirm → data-room unlock
          </p>
        </div>
        <ChatWidget floating={false} />
        <p className="max-w-2xl text-center text-xs text-deal-muted">
          {config.disclaimer} Placeholder consent language is marked [GATED — counsel] pending final
          legal copy.
        </p>
      </div>
    </main>
  );
}
