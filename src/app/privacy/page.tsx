import Link from "next/link";
import ProspectHeader from "@/components/landing/ProspectHeader";
import ProspectFooter from "@/components/landing/ProspectFooter";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-quelliv-navy">
      <ProspectHeader />
      <article className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-semibold uppercase tracking-wide">Privacy Policy</h1>
        <p className="mt-6 text-sm font-light leading-relaxed text-quelliv-muted">
          Quelliv collects contact details and chat content you provide when using Alex so we can
          respond to investor inquiries and deliver data-room access. We do not sell personal
          information. Chat sessions may be logged for compliance and quality. Contact{" "}
          <a href="mailto:scott.absher@quelliv.com" className="text-quelliv-cta underline">
            scott.absher@quelliv.com
          </a>{" "}
          for privacy requests.
        </p>
        <p className="mt-4 text-sm font-light leading-relaxed text-quelliv-muted">
          Placeholder summary for Deal Agent — counsel final copy pending. See also our{" "}
          <Link href="/terms" className="text-quelliv-cta underline">
            Terms of Service
          </Link>
          .
        </p>
        <Link href="/" className="mt-10 inline-block text-sm text-quelliv-cta hover:underline">
          ← Back to Quelliv
        </Link>
      </article>
      <ProspectFooter />
    </main>
  );
}
