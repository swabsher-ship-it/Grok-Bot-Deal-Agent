import Link from "next/link";
import { Suspense } from "react";
import PageviewTracker from "@/components/landing/PageviewTracker";
import ChatWidget from "@/components/chat/ChatWidget";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const { config } = getStore();
  const landing = config.landing;

  return (
    <main className="min-h-screen bg-deal-bg">
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>

      <header className="border-b border-deal-border/60 bg-[#0d101c]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-deal-accent/20 ring-1 ring-deal-accent/40" />
            <div>
              <div className="text-sm font-semibold tracking-wide text-white">Quelliv</div>
              <div className="text-[11px] text-deal-muted">Struxurety DealAgent · Alex</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/start" className="text-deal-muted hover:text-white">
              Start
            </Link>
            <Link href="/admin" className="text-deal-muted hover:text-white">
              Admin
            </Link>
            <Link
              href="/start"
              className="rounded-lg bg-deal-accent px-3 py-1.5 font-medium text-white hover:bg-violet-500"
            >
              {landing.ctaLabel}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-deal-accent">
          Investor Data Room
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-5xl">
          {landing.heroTitle}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-deal-muted">{landing.heroSubtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/start"
            className="rounded-xl bg-deal-accent px-5 py-3 font-semibold text-white hover:bg-violet-500"
          >
            {landing.ctaLabel}
          </Link>
          <a
            href={landing.socialX}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-deal-border px-5 py-3 text-deal-muted hover:border-deal-accent hover:text-white"
          >
            Follow on X
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 md:grid-cols-3">
        {landing.sections.map((s) => (
          <div key={s.title} className="card">
            <h3 className="mb-2 text-lg font-semibold text-white">{s.title}</h3>
            <p className="text-sm leading-relaxed text-deal-muted">{s.body}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-deal-border/60 bg-[#0d101c]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-deal-muted">
            Securities disclosure
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-300">
            {config.disclaimer} This communication is informational only and does not constitute an
            offer to sell or a solicitation of an offer to buy any securities. Any offering is made
            solely by the Private Placement Memorandum and related subscription documents. Alex will
            not invent investment returns, valuations, or allocations. Personalized securities
            questions are escalated to Scott Absher and Mike Keyes.
          </p>
          <p className="mt-6 text-xs text-deal-muted">{landing.footer}</p>
        </div>
      </section>

      <ChatWidget floating />
    </main>
  );
}
