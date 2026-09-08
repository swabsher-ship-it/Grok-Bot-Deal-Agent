"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";

export default function DashboardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const excludeTest = searchParams.get("excludeTest") !== "false";
  const range = searchParams.get("range") || "30d";

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm text-deal-muted">
        <input
          type="checkbox"
          checked={excludeTest}
          onChange={(e) => setParam("excludeTest", e.target.checked ? "true" : "false")}
          className="accent-deal-accent"
        />
        Exclude test leads
      </label>
      <div className="flex overflow-hidden rounded-lg border border-deal-border">
        {(["7d", "30d", "all"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setParam("range", r)}
            className={`px-3 py-2 text-sm ${
              range === r ? "bg-deal-accent text-white" : "bg-[#0f1322] text-deal-muted"
            }`}
          >
            {r === "all" ? "All time" : r}
          </button>
        ))}
      </div>
      <a
        href={`/api/admin/export/leads?excludeTest=${excludeTest}&range=${range}`}
        className="rounded-lg border border-deal-border px-3 py-2 text-sm text-deal-muted hover:text-white"
      >
        Export leads CSV
      </a>
      <a
        href={`/api/admin/export/events?range=${range}`}
        className="rounded-lg border border-deal-border px-3 py-2 text-sm text-deal-muted hover:text-white"
      >
        Export events CSV
      </a>
      {pending ? <span className="text-xs text-deal-muted">Updating…</span> : null}
    </div>
  );
}
