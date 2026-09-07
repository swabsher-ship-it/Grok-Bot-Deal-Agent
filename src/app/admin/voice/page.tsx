import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function VoicePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const { config } = getStore();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Voice</h1>
        <p className="text-sm text-deal-muted">Phase 0 stub · chat-only this week</p>
      </div>
      <div className="card max-w-xl space-y-3">
        <p className="text-sm text-deal-muted">
          Voice POC — coming soon. Password gate for separate voice POC can be wired later.
        </p>
        <div className="rounded-lg border border-deal-border bg-[#0f1322] p-3 text-sm">
          <div className="text-deal-muted">Planned DID pool</div>
          <p className="mt-1 text-white">{config.voiceDidPoolNote}</p>
        </div>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-100">
          SMS outbound remains DISABLED (SMS_OUTBOUND_ENABLED={String(config.SMS_OUTBOUND_ENABLED)}).
          Brand {config.a2pBrandStatus}; Usa2p campaign {config.a2pCampaignSid} = {config.a2pCampaignStatus}.
          Voice DIDs may be planned from MS {config.a2pMessagingServiceSid}; SMS only after campaign VERIFIED.
        </div>
        <input
          type="password"
          placeholder="Voice POC password (stub)"
          className="w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2 text-sm"
          disabled
        />
        <button disabled className="rounded-lg bg-deal-accent/40 px-4 py-2 text-sm text-white">
          Unlock Voice POC (disabled)
        </button>
      </div>
    </div>
  );
}
