"use client";

import { Suspense, useEffect, useRef } from "react";
import PageviewTracker from "@/components/landing/PageviewTracker";
import ProspectHeader from "@/components/landing/ProspectHeader";
import ProspectFooter from "@/components/landing/ProspectFooter";
import ChatWidget, { type ChatWidgetHandle } from "@/components/chat/ChatWidget";

export default function StartPage() {
  const chatRef = useRef<ChatWidgetHandle>(null);

  useEffect(() => {
    chatRef.current?.open();
  }, []);

  return (
    <main className="min-h-screen bg-white text-quelliv-navy">
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      <ProspectHeader />
      <section className="bg-quelliv-section px-6 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 h-[3px] w-12 rounded-full bg-quelliv-cta" />
          <h1 className="text-xl font-semibold uppercase tracking-[0.1em] text-quelliv-navy md:text-2xl">
            I&apos;d Like to Learn More
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] font-light leading-relaxed text-quelliv-muted">
            Chat with Alex to learn more about Quelliv and unlock access to our investor data room.
          </p>
        </div>
      </section>
      <div className="mx-auto flex max-w-2xl justify-center px-6 py-10">
        <ChatWidget ref={chatRef} floating={false} />
      </div>
      <ProspectFooter />
    </main>
  );
}
