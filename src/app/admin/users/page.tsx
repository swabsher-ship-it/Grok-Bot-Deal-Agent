"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("change-me");

  async function load() {
    const res = await fetch("/api/admin/users");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setUsers(data.users || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", name, email, password }),
    });
    setName("");
    setEmail("");
    load();
  }

  async function toggleActive(u: SafeUser) {
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id: u.id, active: !u.active }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-sm text-deal-muted">Add / Edit / Activate admins</p>
      </div>

      <form onSubmit={createUser} className="card grid gap-3 md:grid-cols-4">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-deal-accent px-3 py-2 text-sm text-white">
          Add admin
        </button>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="border-b border-deal-border text-xs uppercase text-deal-muted">
            <tr>
              {["Name", "Email", "Role", "Status", "Created", ""].map((h) => (
                <th key={h || "a"} className="px-3 py-3 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-deal-border/50">
                <td className="px-3 py-2 text-white">{u.name}</td>
                <td className="px-3 py-2 text-deal-muted">{u.email}</td>
                <td className="px-3 py-2 text-deal-muted">{u.role}</td>
                <td className="px-3 py-2">
                  <span className={`badge ${u.active ? "bg-green-500/20 text-green-300" : "bg-slate-500/20 text-slate-300"}`}>
                    {u.active ? "active" : "inactive"}
                  </span>
                </td>
                <td className="px-3 py-2 text-deal-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2">
                  <button onClick={() => toggleActive(u)} className="text-xs text-deal-accent hover:underline">
                    {u.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
