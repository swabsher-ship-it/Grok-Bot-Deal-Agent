import { getAdminSession } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    return <div className="admin-shell min-h-screen bg-deal-bg text-slate-100">{children}</div>;
  }

  return (
    <div className="admin-shell min-h-screen bg-deal-bg text-slate-100">
      <AdminNav email={session.user.email} />
      <div className="mx-auto max-w-[1400px] px-4 py-6">{children}</div>
    </div>
  );
}
