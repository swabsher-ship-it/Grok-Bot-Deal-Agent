from pathlib import Path

# chat-engine: clarify SMS consent does not imply sending
p = Path("src/lib/chat-engine.ts")
t = p.read_text()
old = '''        reply:
          "Thanks. Do you consent to SMS communications about your Quelliv investor access? (A2P verification may limit messaging.) Reply YES or NO.",'''
new = '''        reply:
          "Thanks. Do you consent to future SMS about your Quelliv investor access? (Consent is recorded only — outbound SMS is DISABLED until our A2P campaign is VERIFIED.) Reply YES or NO.",'''
if old not in t:
    raise SystemExit("chat-engine sms prompt missing")
p.write_text(t.replace(old, new, 1))
print("chat-engine ok")

# Add sms guard helper
guard = Path("src/lib/sms.ts")
guard.write_text('''import type { CampaignConfig } from "./types";

/**
 * Outbound SMS is hard-disabled until Usa2p campaign is VERIFIED.
 * Brand may be APPROVED/VERIFIED while campaign remains FAILED (e.g. 30896).
 * Consent collection is always allowed; sending is not.
 */
export function canSendSms(config: CampaignConfig): boolean {
  return (
    config.SMS_OUTBOUND_ENABLED === true &&
    config.a2pCampaignStatus === "VERIFIED" &&
    Boolean(config.a2pMessagingServiceSid)
  );
}

export function smsDisabledReason(config: CampaignConfig): string {
  if (config.SMS_OUTBOUND_ENABLED !== true) {
    return "SMS_OUTBOUND_ENABLED=false (feature flag)";
  }
  if (config.a2pCampaignStatus !== "VERIFIED") {
    return `Usa2p campaign ${config.a2pCampaignSid} status=${config.a2pCampaignStatus} (need VERIFIED on MS ${config.a2pMessagingServiceSid})`;
  }
  return "ok";
}
''')
print("sms guard ok")

# Patch chat route deliveries to never use SMS channel while disabled
chat = Path("src/app/api/chat/route.ts")
ct = chat.read_text()
if "canSendSms" not in ct:
    ct = ct.replace(
        'import { nextGateReply, type GateSession, type GateStep } from "@/lib/chat-engine";',
        'import { nextGateReply, type GateSession } from "@/lib/chat-engine";\nimport { canSendSms } from "@/lib/sms";',
    )
    # force EMAIL channel
    ct = ct.replace(
        'channel: "EMAIL",',
        'channel: canSendSms(store.config) ? "SMS" : "EMAIL",',
    )
    # Actually for unlock we always want email when SMS disabled - the ternary above is fine if we pass SMS only when enabled, but unlock delivery should prefer email. Keep EMAIL always for unlock docs.
    ct = ct.replace(
        'channel: canSendSms(store.config) ? "SMS" : "EMAIL",',
        'channel: "EMAIL", // SMS outbound disabled until A2P VERIFIED; consent-only',
    )
    chat.write_text(ct)
    print("chat route ok")
else:
    print("chat route already patched")
