export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    New: "bg-slate-500/20 text-slate-300",
    Engaged: "bg-blue-500/20 text-blue-300",
    "Info Collected": "bg-cyan-500/20 text-cyan-300",
    "Docs Sent": "bg-green-500/20 text-green-300",
    "Doc Viewed": "bg-emerald-500/20 text-emerald-300",
    "Meeting Booked": "bg-violet-500/20 text-violet-300",
    "Handed Off": "bg-amber-500/20 text-amber-300",
    "Opted Out": "bg-red-500/20 text-red-300",
    Closed: "bg-zinc-500/20 text-zinc-300",
  };
  return (
    <span className={`badge ${map[status] || "bg-slate-500/20 text-slate-300"}`}>
      {status.toLowerCase()}
    </span>
  );
}
