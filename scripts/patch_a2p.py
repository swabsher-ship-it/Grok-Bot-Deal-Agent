from pathlib import Path

types = Path("src/lib/types.ts")
text = types.read_text()
old = "  escalation: { email: string; sms: string };\n}"
new = """  escalation: { email: string; sms: string };
  /** Twilio Messaging Service for A2P / voice DID pool (MS MGefe912…). */
  a2pMessagingServiceSid: string;
  /** Usa2p campaign id (QE2c6890… currently FAILED 30896 — do not enable SMS until VERIFIED). */
  a2pCampaignSid: string;
  a2pBrandStatus: "APPROVED" | "PENDING" | "FAILED";
  a2pCampaignStatus: "VERIFIED" | "FAILED" | "PENDING";
  /** Hard kill-switch: SMS outbound DISABLED until Usa2p campaign VERIFIED. Consent collection still OK. */
  SMS_OUTBOUND_ENABLED: boolean;
  voiceDidPoolNote: string;
}"""
if old not in text:
    raise SystemExit("types patch anchor missing")
types.write_text(text.replace(old, new, 1))
print("types ok")

seed = Path("src/lib/seed.ts")
st = seed.read_text()
old2 = """    escalation: {
      email: "scott.absher@quelliv.com",
      sms: "+15551234002",
    },
  };"""
new2 = """    escalation: {
      email: "scott.absher@quelliv.com",
      sms: "+15551234002",
    },
    a2pMessagingServiceSid: "MGefe912",
    a2pCampaignSid: "QE2c6890",
    a2pBrandStatus: "APPROVED",
    a2pCampaignStatus: "FAILED",
    SMS_OUTBOUND_ENABLED: false,
    voiceDidPoolNote:
      "Voice DID can be planned from the 9 numbers on Messaging Service MGefe912. SMS outbound stays DISABLED until Usa2p campaign QE2c6890 is VERIFIED (currently FAILED 30896). Collect SMS consent OK; never send SMS while SMS_OUTBOUND_ENABLED=false.",
  };"""
if old2 not in st:
    raise SystemExit("seed patch anchor missing")
st = st.replace(old2, new2, 1)
st = st.replace(
    "No SMS delivery promises beyond consent capture.",
    "Collect SMS consent OK. Do NOT send SMS — SMS_OUTBOUND_ENABLED=false (Usa2p campaign FAILED 30896). Email-only for data-room delivery until campaign VERIFIED on MS MGefe912.",
)
seed.write_text(st)
print("seed ok")
