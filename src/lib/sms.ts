import type { CampaignConfig } from "./types";

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
