import Image from "next/image";
import Link from "next/link";

export default function ProspectHeader() {
  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-quelliv-border/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center px-6">
        <Link href="/" className="inline-flex items-center" aria-label="Quelliv home">
          <Image
            src="/images/quelliv-logo.png"
            alt="Quelliv"
            width={160}
            height={40}
            className="h-9 w-auto"
            priority
          />
        </Link>
      </div>
    </header>
  );
}
