import Link from "next/link";
import ProspectHeader from "@/components/landing/ProspectHeader";
import ProspectFooter from "@/components/landing/ProspectFooter";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-quelliv-navy">
      <ProspectHeader />
      <article className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-semibold uppercase tracking-wide">Terms of Service</h1>
        <p className="mt-6 text-sm font-light leading-relaxed text-quelliv-muted">
          These terms govern use of this Quelliv website and the Alex assistant. Chat may be logged.
          Please don&apos;t send payment details or financial documents in the chat. By using this
          site you agree to these terms and to the Privacy Policy.
        </p>
        <p className="mt-4 text-sm font-light leading-relaxed text-quelliv-muted">
          Placeholder summary for Deal Agent — counsel final copy pending. See also our{" "}
          <Link href="/privacy" className="text-quelliv-cta underline">
            Privacy Policy
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
