import type { CampaignConfig, ConsentRecord, Lead, LeadState } from "./types";
import {
  STRUXURETY_INVESTING_REPLY,
  isStruxuretyInvestingQuestion,
  quellivOfferingReply,
} from "./offering-guardrails";

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

export interface StruxuretyInterest {
  phase: "contact" | "email" | "done";
  name?: string;
  email?: string;
}

export interface GateSession {
  step: GateStep;
  name?: string;
  email?: string;
  phone?: string;
  consents?: Partial<ConsentRecord>;
  smsConsent?: boolean;
  leadId?: string;
  unlocked?: boolean;
  /** STATE 0 name-and-email capture. Not a Quelliv data-room login. */
  struxuretyInterest?: StruxuretyInterest;
}

/** Public greeting. Ignores config.welcome so admin copy cannot pitch an offering. */
export const PUBLIC_GREETING =
  "Hi, I'm Alex with Quelliv. I can take a request for access or answer a general question about the company. What would you like to do?";

export function initialAssistantMessage(_config: CampaignConfig): string {
  return PUBLIC_GREETING;
}

export function consentPrompt(): string {
  return [
    "Before we start:",
    "",
    "1. This chat is with an AI assistant and may be logged.",
    "2. Please don't send payment details or financial documents here.",
    "",
    "Reply YES to continue, or ask a question.",
  ].join("\n");
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

function extractEmail(text: string): string | null {
  const match = text.match(EMAIL_RE);
  return match ? match[0] : null;
}

function extractName(text: string, email: string | null): string | null {
  const stripped = email ? text.replace(email, " ") : text;
  const name = stripped.replace(/[^A-Za-z\s.'-]/g, " ").replace(/\s+/g, " ").trim();
  if (name.length < 2) return null;
  if (/\b(invest|wire|return|valuation|capital|offering|price|struxurety|quelliv)\b/i.test(name)) return null;
  return name;
}

function struxuretyAsk(session: GateSession, extra?: string) {
  const reply = extra ? `${STRUXURETY_INVESTING_REPLY} ${extra}` : STRUXURETY_INVESTING_REPLY;
  return { reply, session };
}

function handleStruxurety(
  session: GateSession,
  text: string,
  lower: string
): { reply: string; session: GateSession; leadPatch?: Partial<Lead> } | null {
  const capture = session.struxuretyInterest;
  const asking = isStruxuretyInvestingQuestion(lower);

  if (!capture && !asking) return null;

  if (capture?.phase === "done") {
    if (asking) return struxuretyAsk(session);
    return null;
  }

  if (!capture) {
    return struxuretyAsk(
      { ...session, struxuretyInterest: { phase: "contact" } },
      "Please send your name and email."
    );
  }

  const email = extractEmail(text);
  const name = extractName(text, email) || capture.name;

  if (email && name) {
    const next: GateSession = {
      ...session,
      name,
      email,
      struxuretyInterest: { phase: "done", name, email },
    };
    return {
      reply: `Thanks, ${name}. I've noted your interest and Scott's team will follow up at ${email}.`,
      session: next,
      leadPatch: { name, email, status: "Info Collected", state: "Collect Email" },
    };
  }

  if (name && !email) {
    const next: GateSession = {
      ...session,
      name,
      struxuretyInterest: { phase: "email", name },
    };
    return {
      reply: "Thanks. What email should Scott's team use?",
      session: next,
      leadPatch: { name, state: "Collect Email" },
    };
  }

  if (email && !name) {
    return {
      reply: "Thanks. What name should I note?",
      session: {
        ...session,
        email,
        struxuretyInterest: { phase: "contact", email },
      },
      leadPatch: { email, state: "Collect Name" },
    };
  }

  return struxuretyAsk(session, "Please send your name and email only.");
}

export function nextGateReply(
  session: GateSession,
  userText: string,
  config: CampaignConfig,
  hasDataRoomAccess = false
): { reply: string; session: GateSession; unlock?: boolean; leadPatch?: Partial<Lead> } {
  const text = userText.trim();
  const lower = text.toLowerCase();

  // Gate completion is not data-room login. Price and size stay off unless a
  // caller passes a separately verified flag. The public API never does.
  const struxurety = handleStruxurety(session, text, lower);
  if (struxurety) return struxurety;

  const offeringReply = quellivOfferingReply(lower, hasDataRoomAccess);
  if (offeringReply) return { reply: offeringReply, session };

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
          reply: `Thanks, ${text.split(" ")[0]}. What's the best email for your access request?`,
          session: { ...session, step: "email", name: text },
          leadPatch: { name: text, state: "Collect Email" as LeadState, status: "Engaged" },
        };
      }
      return {
        reply: "If you'd like to request access, say yes and I'll take your name and email. What can I help with?",
        session,
      };
    }
    case "consent": {
      if (lower === "yes" || lower.includes("accept") || lower.includes("agree")) {
        const next: GateSession = {
          ...session,
          step: "name",
          consents: {
            accreditedAck: false,
            confidentialityAck: true,
            electronicDeliveryAck: true,
            aiDisclosureAck: true,
            securitiesAck: false,
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
        reply: "Please reply YES to continue, or ask a question.",
        session,
      };
    }
    case "name": {
      if (text.length < 2) {
        return { reply: "Please share your full name so I can set up your access request.", session };
      }
      return {
        reply: `Thanks, ${text.split(" ")[0]}. What's the best email for your access request?`,
        session: { ...session, step: "email", name: text },
        leadPatch: { name: text, state: "Collect Email" },
      };
    }
    case "email": {
      if (!text.includes("@") || !text.includes(".")) {
        return { reply: "That doesn't look like an email address. Please enter a valid email.", session };
      }
      return {
        reply: "Got it. What's your mobile phone number? (Include a country code if you are outside the US.)",
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
          "Thanks. Do you consent to future text messages about your access request? Consent is recorded only, and outbound texts stay off for now. Reply YES or NO.",
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
        `• Text-message consent: ${sms ? "Yes" : "No"}`,
        "",
        "Reply CONFIRM to submit your access request, or tell me what to correct.",
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
        return {
          reply:
            "Your access request is recorded. A teammate will follow up by email. I can't take a commitment or send documents in this chat.",
          session: { ...session, step: "chat", unlocked: false },
          unlock: false,
          leadPatch: {
            status: "Info Collected",
            state: "Confirm Information",
            consents: {
              accreditedAck: false,
              confidentialityAck: true,
              electronicDeliveryAck: true,
              aiDisclosureAck: true,
              securitiesAck: false,
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
        reply: "Reply CONFIRM to submit your access request, or say name, email, or phone to correct a field.",
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

function answerKnowledge(lower: string, config: CampaignConfig): string {
  if (/\b(what is quelliv|who is quelliv|about the company|what do you do)\b/.test(lower)) {
    return "Quelliv is the company this assistant represents. A public overview is on quelliv.com. I can also take a request for access.";
  }
  if (lower.includes("book") || lower.includes("scott") || lower.includes("mike") || lower.includes("meeting")) {
    return `For a meeting, use meet.quelliv.com or email ${config.escalation.email}.`;
  }
  return `I'm ${config.agentName} with Quelliv. I can take a request for access or help with a general question. What would you like to do?`;
}
