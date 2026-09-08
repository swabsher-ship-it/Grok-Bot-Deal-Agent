import type { CampaignConfig, ConsentRecord, Lead, LeadState } from "./types";

export type GateStep =
  | "consent"
  | "interest"
  | "name"
  | "email"
  | "phone"
  | "sms"
  | "confirm"
  | "unlocked"
  | "chat";

export interface GateSession {
  step: GateStep;
  name?: string;
  email?: string;
  phone?: string;
  consents?: Partial<ConsentRecord>;
  smsConsent?: boolean;
  leadId?: string;
  unlocked?: boolean;
}

export function initialAssistantMessage(config: CampaignConfig): string {
  return (
    config.welcome ||
    `Hi there! I'm ${config.agentName}, a friendly AI assistant from Quelliv. Thanks for your interest in learning more about us! I'd love to help you learn more about the opportunity and get you access to our investor materials. No pressure at all — are you interested in learning more?`
  );
}

export function consentPrompt(): string {
  return [
    "Please review and accept the following acknowledgments (placeholder copy — [GATED — counsel]):",
    "",
    "1. Accredited investor / suitability acknowledgment — [GATED — counsel]",
    "2. Confidentiality / non-disclosure of data-room materials — [GATED — counsel]",
    "3. Electronic delivery & communications consent — [GATED — counsel]",
    "4. Recording / AI-assistant disclosure (chat may be logged; not investment advice) — [GATED — counsel]",
    "5. Securities disclaimer acknowledgment — [GATED — counsel]",
    "",
    "Reply YES to accept all and start, or ask a question.",
  ].join("\n");
}

export function nextGateReply(
  session: GateSession,
  userText: string,
  config: CampaignConfig
): { reply: string; session: GateSession; unlock?: boolean; leadPatch?: Partial<Lead> } {
  const text = userText.trim();
  const lower = text.toLowerCase();

  if (looksLikeSecuritiesAdvice(lower)) {
    return {
      reply: `I can't provide personalized investment advice, returns, valuations, or allocation guidance. Please book time with Scott Absher or Mike Keyes (${config.escalation.email}). I can still help you unlock the Quelliv Investor Preview / Data Room and orient you to the document packet.`,
      session,
    };
  }

  switch (session.step) {
    case "interest": {
      if (
        lower.startsWith("y") ||
        lower.includes("interest") ||
        lower.includes("learn") ||
        lower.includes("sure") ||
        lower.includes("ok") ||
        lower.includes("please")
      ) {
        return {
          reply: "Great — what's your full name?",
          session: { ...session, step: "name" },
          leadPatch: { state: "Collect Name" as LeadState, status: "Engaged" },
        };
      }
      if (text.length >= 2 && text.split(" ").length >= 2 && !lower.includes("?")) {
        return {
          reply: `Thanks, ${text.split(" ")[0]}. What's the best email for your Quelliv Investor Preview / Data Room access link?`,
          session: { ...session, step: "email", name: text },
          leadPatch: { name: text, state: "Collect Email" as LeadState, status: "Engaged" },
        };
      }
      return {
        reply: "No pressure at all. If you'd like to explore Quelliv's investor materials, just say yes and I'll get you set up. What's on your mind?",
        session,
      };
    }
    case "consent": {
      if (lower === "yes" || lower.includes("accept") || lower.includes("agree")) {
        const next: GateSession = {
          ...session,
          step: "name",
          consents: {
            accreditedAck: true,
            confidentialityAck: true,
            electronicDeliveryAck: true,
            aiDisclosureAck: true,
            securitiesAck: true,
            smsConsent: false,
            consentedAt: new Date().toISOString(),
          },
        };
        return {
          reply: "Thank you. What's your full name?",
          session: next,
          leadPatch: { state: "Collect Name" as LeadState, status: "Engaged" },
        };
      }
      return {
        reply: "I need your acceptance of the acknowledgments before we continue. Reply YES when ready, or ask me about the process.",
        session,
      };
    }
    case "name": {
      if (text.length < 2) {
        return { reply: "Please share your full name so I can set up your access.", session };
      }
      return {
        reply: `Thanks, ${text.split(" ")[0]}. What's the best email for your Quelliv Investor Preview / Data Room access link?`,
        session: { ...session, step: "email", name: text },
        leadPatch: { name: text, state: "Collect Email" },
      };
    }
    case "email": {
      if (!text.includes("@") || !text.includes(".")) {
        return { reply: "That doesn't look like an email address. Please enter a valid email.", session };
      }
      return {
        reply: "Got it. What's your mobile phone number? (Include country code if outside the US.)",
        session: { ...session, step: "phone", email: text },
        leadPatch: { email: text, state: "Collect Phone" },
      };
    }
    case "phone": {
      const digits = text.replace(/\D/g, "");
      if (digits.length < 10) {
        return { reply: "Please provide a valid mobile number with at least 10 digits.", session };
      }
      return {
        reply:
          "Thanks. Do you consent to future SMS about your Quelliv investor access? (Consent is recorded only — outbound SMS is DISABLED until our A2P campaign is VERIFIED.) Reply YES or NO.",
        session: { ...session, step: "sms", phone: text },
        leadPatch: { phone: text, state: "Confirm Information" },
      };
    }
    case "sms": {
      const sms = lower.startsWith("y");
      const summary = [
        "Please confirm your details:",
        `• Name: ${session.name}`,
        `• Email: ${session.email}`,
        `• Phone: ${session.phone}`,
        `• SMS consent: ${sms ? "Yes" : "No"}`,
        "",
        "Reply CONFIRM to unlock the Quelliv Investor Preview / Data Room, or tell me what to correct.",
      ].join("\n");
      return {
        reply: summary,
        session: {
          ...session,
          step: "confirm",
          smsConsent: sms,
          consents: { ...session.consents, smsConsent: sms },
        },
      };
    }
    case "confirm": {
      if (lower.includes("confirm") || lower === "yes") {
        const unlocked: GateSession = { ...session, step: "unlocked", unlocked: true };
        return {
          reply: [
            `You're all set. I'm unlocking the Quelliv Investor Preview / Data Room now.`,
            "",
            `Investor Preview / Data Room: ${config.dataRoomUrl}`,
            "",
            `You can ask me about the deck, model, PPM, subscription agreement, or recommended review order. I will not invent terms, returns, or valuations — those live in the official documents. For personalized questions, contact Scott Absher / Mike Keyes.`,
          ].join("\n"),
          session: unlocked,
          unlock: true,
          leadPatch: {
            status: "Docs Sent",
            state: "Send Documents",
            consents: {
              accreditedAck: true,
              confidentialityAck: true,
              electronicDeliveryAck: true,
              aiDisclosureAck: true,
              securitiesAck: true,
              smsConsent: !!session.smsConsent,
              consentedAt: session.consents?.consentedAt || new Date().toISOString(),
            },
          },
        };
      }
      if (lower.includes("name")) {
        return { reply: "Okay — what's the correct full name?", session: { ...session, step: "name" } };
      }
      if (lower.includes("email")) {
        return { reply: "Okay — what's the correct email?", session: { ...session, step: "email" } };
      }
      if (lower.includes("phone")) {
        return { reply: "Okay — what's the correct phone?", session: { ...session, step: "phone" } };
      }
      return {
        reply: "Reply CONFIRM to unlock, or say name/email/phone to correct a field.",
        session,
      };
    }
    case "unlocked":
    case "chat":
    default: {
      return {
        reply: answerKnowledge(lower, config),
        session: { ...session, step: "chat" },
      };
    }
  }
}

function looksLikeSecuritiesAdvice(lower: string): boolean {
  const triggers = [
    "what will i make",
    "guaranteed",
    "return",
    "roi",
    "valuation",
    "how much can i",
    "wire instruction",
    "wiring",
    "allocation",
    "share price",
  ];
  return triggers.some((t) => lower.includes(t));
}

function answerKnowledge(lower: string, config: CampaignConfig): string {
  if (lower.includes("ppm")) {
    return "The PPM (Private Placement Memorandum) is the primary disclosure document covering risks and terms. I can point you to it in the data room — I don't paraphrase offering terms as advice. Read the PPM directly for anything binding.";
  }
  if (lower.includes("subscription") || lower.includes("sub agreement")) {
    return "The Subscription Agreement is the instrument investors execute to participate (accredited path). Recommended order is typically deck → model overview → PPM → subscription. Exact signing steps should follow the packet instructions; escalate edge cases to Scott / Mike.";
  }
  if (lower.includes("deck") || lower.includes("pitch")) {
    return "The investor deck covers Quelliv's narrative and is informational — it is not a subscription instrument. After the deck, many investors review the model for diligence orientation, then the PPM.";
  }
  if (lower.includes("model") || lower.includes("financial")) {
    return "The financial model is for diligence orientation only. I won't invent or guarantee returns from it. Treat figures as illustrative and defer to the PPM for offering terms.";
  }
  if (lower.includes("room") || lower.includes("link") || lower.includes("access")) {
    return `Your Quelliv Investor Preview / Data Room link: ${config.dataRoomUrl}. Ask me about any document category in the packet.`;
  }
  if (lower.includes("book") || lower.includes("scott") || lower.includes("mike") || lower.includes("meeting")) {
    return `For meetings with Scott Absher or Mike Keyes, use the book path on Quelliv (meet.quelliv.com) or email ${config.escalation.email}.`;
  }
  return `I'm ${config.agentName} — Ask Alex, Quelliv's in-room assistant and Data Room gatekeeper. I can help with Investor Preview / Data Room orientation (deck, model, PPM, subscription, warrants, notices) and process questions. I don't invent investment returns or terms. What would you like to know?`;
}
