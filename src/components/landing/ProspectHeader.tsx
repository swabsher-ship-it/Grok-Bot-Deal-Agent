import Link from "next/link";

export default function ProspectHeader() {
  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-quelliv-border/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center px-6">
        <Link href="/" className="font-brand text-[2.15rem] leading-none text-[#1a1a1a]">
          Quelliv
        </Link>
      </div>
    </header>
  );
}
