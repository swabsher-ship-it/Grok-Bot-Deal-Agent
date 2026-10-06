"use client";

import { Suspense, useRef } from "react";
import PageviewTracker from "@/components/landing/PageviewTracker";
import ProspectHeader from "@/components/landing/ProspectHeader";
import ProspectFooter from "@/components/landing/ProspectFooter";
import ChatWidget, { type ChatWidgetHandle } from "@/components/chat/ChatWidget";
import { trackClient } from "@/lib/client/analytics";

export default function HomePage() {
  const chatRef = useRef<ChatWidgetHandle>(null);

  return (
    <main className="min-h-screen bg-white text-quelliv-navy">
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>

      <ProspectHeader />

      <section className="hero-waves relative overflow-hidden px-6 pb-24 pt-28 md:pb-32 md:pt-36">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="text-[1.75rem] font-semibold uppercase tracking-[0.08em] text-quelliv-navy sm:text-3xl md:text-[2.65rem] md:leading-tight">
            Quelliv
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-quelliv-navy md:text-lg">
            Quelliv is the company behind this site. Request access if you would like a teammate to
            follow up.
          </p>
        </div>
      </section>

      <section className="bg-quelliv-section px-6 py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 h-[3px] w-12 rounded-full bg-quelliv-cta" />
          <h2 className="text-xl font-semibold uppercase tracking-[0.1em] text-quelliv-navy md:text-2xl">
            Request access
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] font-light leading-relaxed text-quelliv-muted md:text-base">
            Chat with Alex, our AI assistant, and share your name and email. This is a request for
            access only. You are not asked to commit to anything here.
          </p>
          <button
            type="button"
            onClick={() => {
              trackClient({ type: "learn_more_click" });
              chatRef.current?.open();
            }}
            className="mt-10 rounded-xl bg-quelliv-cta px-10 py-3.5 text-sm font-medium tracking-wide text-white shadow-cta transition hover:brightness-105"
          >
            Request access
          </button>
        </div>
      </section>

      <ProspectFooter />

      <ChatWidget ref={chatRef} floating />
    </main>
  );
}
