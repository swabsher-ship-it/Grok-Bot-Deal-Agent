"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("scott.absher@quelliv.com");
  const [password, setPassword] = useState("change-me");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-deal-bg px-4">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-white">DealAgent Admin</h1>
          <p className="text-sm text-deal-muted">Struxurety · Quelliv campaign</p>
        </div>
        <label className="block text-sm">
          <span className="text-deal-muted">Email</span>
          <input
            className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 outline-none focus:border-deal-accent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-deal-muted">Password</span>
          <input
            className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 outline-none focus:border-deal-accent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </label>
        {error && <p className="text-sm text-deal-red">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-deal-accent py-2 font-medium text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
