"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Phone } from "lucide-react";

const tabs = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/conversations", label: "Conversations" },
  { href: "/admin/logs", label: "Logs" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/config", label: "Config" },
  { href: "/admin/voice", label: "Voice" },
];

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-deal-border bg-[#0d101c]">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3">
        <div className="text-sm font-semibold text-white">DealAgent Admin</div>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`rounded-md px-2.5 py-1.5 ${
                  active ? "bg-deal-accent/20 text-white" : "text-deal-muted hover:text-white"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 text-xs text-deal-muted">
          <span className="hidden sm:inline">{email}</span>
          <Phone size={14} />
          <button onClick={signOut} className="hover:text-white">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
