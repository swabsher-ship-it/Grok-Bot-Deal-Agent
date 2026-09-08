"use client";

import { Suspense, useRef } from "react";
import PageviewTracker from "@/components/landing/PageviewTracker";
import ProspectHeader from "@/components/landing/ProspectHeader";
import ProspectFooter from "@/components/landing/ProspectFooter";
import ChatWidget, { type ChatWidgetHandle } from "@/components/chat/ChatWidget";
import { trackClient } from "@/lib/client/analytics";

const DISCLOSURE =
  "DISCLOSURE: All information contained in this communication should not be considered investment advice nor an offer to buy or sell securities, and for informational purposes only. Investing in private or early-stage offerings involves a high degree of risk. Securities sold through these offerings are not (most of the time) publicly traded and, therefore, tend to be illiquid. Additionally, investors may receive restricted stock that is subject to holding period requirements. Companies seeking capital through these offerings tend to be in earlier stages of development and have not yet been fully tested in the public marketplace. Investing in private or early-stage offerings requires a tolerance for high risk, low liquidity, and a long-term commitment. Investors must be able to afford to lose their entire investment. Such investment products are not FDIC insured, may lose value, and have no bank guarantee.";

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
            Explore an Investment in Quelliv
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-quelliv-navy md:text-lg">
            Thank you for your interest in Quelliv. We are anxious to meet you and introduce you to
            what we are building and how you can be a part.
          </p>
        </div>
      </section>

      <section className="bg-quelliv-section px-6 py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 h-[3px] w-12 rounded-full bg-quelliv-cta" />
          <h2 className="text-xl font-semibold uppercase tracking-[0.1em] text-quelliv-navy md:text-2xl">
            I&apos;d Like to Learn More
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] font-light leading-relaxed text-quelliv-muted md:text-base">
            Have questions about investing with Quelliv? Chat with Alex, our AI assistant, to learn
            more about our investment opportunity, get answers to your questions, and receive access
            to our investor data room.
          </p>
          <button
            type="button"
            onClick={() => {
              trackClient({ type: "learn_more_click" });
              chatRef.current?.open();
            }}
            className="mt-10 rounded-xl bg-quelliv-cta px-10 py-3.5 text-sm font-medium tracking-wide text-white shadow-cta transition hover:brightness-105"
          >
            Learn More
          </button>
        </div>
      </section>

      <section className="bg-white px-6 py-12">
        <p className="mx-auto max-w-4xl text-center text-[12px] font-light leading-relaxed text-quelliv-muted">
          {DISCLOSURE}
        </p>
      </section>

      <ProspectFooter />

      <ChatWidget ref={chatRef} floating />
    </main>
  );
}
