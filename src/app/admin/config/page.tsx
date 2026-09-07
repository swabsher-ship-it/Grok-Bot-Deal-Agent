"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CampaignConfig } from "@/lib/types";

export default function ConfigPage() {
  const router = useRouter();
  const [config, setConfig] = useState<CampaignConfig | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => data && setConfig(data.config));
  }, [router]);

  async function save() {
    if (!config) return;
    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    if (data.ok) {
      setConfig(data.config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (!config) return <p className="text-deal-muted">Loading config…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Config</h1>
          <p className="text-sm text-deal-muted">
            Org {config.org} · Campaign {config.campaign} · Agent {config.agentName}
          </p>
        </div>
        <button onClick={save} className="rounded-lg bg-deal-accent px-4 py-2 text-sm text-white">
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <div className="card space-y-3 border-amber-500/30">
        <h3 className="font-medium text-amber-200">A2P / SMS gate</h3>
        <p className="text-xs text-deal-muted">
          Collect SMS consent OK. Do not send SMS until Usa2p campaign is VERIFIED on the Messaging
          Service. Brand may be APPROVED while campaign is FAILED.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="text-deal-muted">a2pMessagingServiceSid</span>
            <input
              className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
              value={config.a2pMessagingServiceSid}
              onChange={(e) => setConfig({ ...config, a2pMessagingServiceSid: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="text-deal-muted">a2pCampaignSid</span>
            <input
              className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
              value={config.a2pCampaignSid}
              onChange={(e) => setConfig({ ...config, a2pCampaignSid: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="text-deal-muted">a2pBrandStatus</span>
            <select
              className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
              value={config.a2pBrandStatus}
              onChange={(e) =>
                setConfig({
                  ...config,
                  a2pBrandStatus: e.target.value as CampaignConfig["a2pBrandStatus"],
                })
              }
            >
              <option value="APPROVED">APPROVED</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-deal-muted">a2pCampaignStatus</span>
            <select
              className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
              value={config.a2pCampaignStatus}
              onChange={(e) =>
                setConfig({
                  ...config,
                  a2pCampaignStatus: e.target.value as CampaignConfig["a2pCampaignStatus"],
                })
              }
            >
              <option value="VERIFIED">VERIFIED</option>
              <option value="FAILED">FAILED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={config.SMS_OUTBOUND_ENABLED}
              onChange={(e) => setConfig({ ...config, SMS_OUTBOUND_ENABLED: e.target.checked })}
            />
            <span>
              SMS_OUTBOUND_ENABLED (keep false until campaign VERIFIED — no real Twilio SMS sends)
            </span>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-deal-muted">voiceDidPoolNote</span>
          <textarea
            className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
            rows={3}
            value={config.voiceDidPoolNote}
            onChange={(e) => setConfig({ ...config, voiceDidPoolNote: e.target.value })}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="card text-sm">
          <span className="text-deal-muted">Agent name</span>
          <input
            className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
            value={config.agentName}
            onChange={(e) => setConfig({ ...config, agentName: e.target.value })}
          />
        </label>
        <label className="card text-sm">
          <span className="text-deal-muted">Data room URL</span>
          <input
            className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
            value={config.dataRoomUrl}
            onChange={(e) => setConfig({ ...config, dataRoomUrl: e.target.value })}
          />
        </label>
        <label className="card text-sm md:col-span-2">
          <span className="text-deal-muted">Welcome</span>
          <textarea
            className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
            rows={3}
            value={config.welcome}
            onChange={(e) => setConfig({ ...config, welcome: e.target.value })}
          />
        </label>
        <label className="card text-sm md:col-span-2">
          <span className="text-deal-muted">Persona</span>
          <textarea
            className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
            rows={4}
            value={config.persona}
            onChange={(e) => setConfig({ ...config, persona: e.target.value })}
          />
        </label>
        <label className="card text-sm md:col-span-2">
          <span className="text-deal-muted">Conversation guidance</span>
          <textarea
            className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
            rows={3}
            value={config.conversationGuidance}
            onChange={(e) => setConfig({ ...config, conversationGuidance: e.target.value })}
          />
        </label>
        <label className="card text-sm md:col-span-2">
          <span className="text-deal-muted">Knowledge</span>
          <textarea
            className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
            rows={4}
            value={config.knowledge}
            onChange={(e) => setConfig({ ...config, knowledge: e.target.value })}
          />
        </label>
        <label className="card text-sm md:col-span-2">
          <span className="text-deal-muted">Disclaimer</span>
          <textarea
            className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
            rows={3}
            value={config.disclaimer}
            onChange={(e) => setConfig({ ...config, disclaimer: e.target.value })}
          />
        </label>
        <label className="card text-sm">
          <span className="text-deal-muted">Escalation email</span>
          <input
            className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
            value={config.escalation.email}
            onChange={(e) =>
              setConfig({ ...config, escalation: { ...config.escalation, email: e.target.value } })
            }
          />
        </label>
        <label className="card text-sm">
          <span className="text-deal-muted">Escalation SMS (ops notify only — not investor A2P)</span>
          <input
            className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
            value={config.escalation.sms}
            onChange={(e) =>
              setConfig({ ...config, escalation: { ...config.escalation, sms: e.target.value } })
            }
          />
        </label>
        <label className="card text-sm md:col-span-2">
          <span className="text-deal-muted">Landing hero title</span>
          <input
            className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
            value={config.landing.heroTitle}
            onChange={(e) =>
              setConfig({ ...config, landing: { ...config.landing, heroTitle: e.target.value } })
            }
          />
        </label>
      </div>

      <div className="card">
        <h3 className="mb-2 font-medium text-white">Per-state goals</h3>
        <div className="space-y-2">
          {Object.entries(config.stateGoals).map(([k, v]) => (
            <label key={k} className="block text-sm">
              <span className="text-deal-muted">{k}</span>
              <input
                className="mt-1 w-full rounded-lg border border-deal-border bg-[#0f1322] px-3 py-2"
                value={v}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    stateGoals: { ...config.stateGoals, [k]: e.target.value },
                  })
                }
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
