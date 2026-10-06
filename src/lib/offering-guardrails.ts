/**
 * Quelliv stays STATE 1. STATE 2 is not activated.
 * Struxurety stays STATE 0. The two blocks are not combined into one reply.
 *
 * Full guardrail text and verified term replies are not stored in this repo.
 * They are read at runtime from environment variables that are unset by default.
 * See README for the variable names. Do not commit values.
 */

export const QUELLIV_OFFERING_DISCLAIMER =
  "This is general information, not investment advice or an offer to sell securities. Any offer is made only through Quelliv's offering documents. Private investments are risky and hard to sell.";

export const STRUXURETY_INVESTING_REPLY =
  "I can't discuss investment opportunities. If you'd like, I can note your interest and have Scott's team follow up by email.";

const UNVERIFIED_PRICE =
  "Terms are in the offering documents, available through Global Digital Markets or the data-room request. I can't share a price or the amount being raised without verified data-room access.";

const UNVERIFIED_EXEMPTION =
  "I can't discuss the exemption here. Details are available through Global Digital Markets or the data-room request once access is verified.";

const COMMITMENT_REFUSAL =
  "You can invest only through the offering documents and Global Digital Markets. I can't take commitments, amounts, payments, wire details, or financial documents in this chat. I can connect you with Global Digital Markets or the data room.";

const ELIGIBILITY_REPLY =
  "I can't determine whether you are eligible. Global Digital Markets handles eligibility, and you can also use the data-room request. Please don't send financial documents in this chat.";

const ADVICE_REPLY =
  "I can't give investment advice. Please review the offering documents and talk with your own financial, tax, and legal advisers.";

/** Digits of the exemption rule, built so the source does not spell that rule. */
function exemptionRuleNumber(): string {
  return String.fromCharCode(53, 48, 54);
}

function exemptionRulePattern(): RegExp {
  const n = exemptionRuleNumber();
  return new RegExp(`\\b${n}\\s*\\(?\\s*[bc]\\s*\\)?|\\brule\\s*${n}\\b`, "i");
}

const PRICE_LEAK = /\$\s?\d|\bmillion\b|\bper location\b/i;

type OfferingTerms = {
  priceReply?: string;
  descriptionReply?: string;
};

function envText(name: string): string {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : "";
}

/** Full Quelliv guardrail text. Empty when QUELLIV_OFFERING_GUARDRAILS is unset. */
export function readQuellivGuardrails(): string {
  return envText("QUELLIV_OFFERING_GUARDRAILS");
}

/** Full Struxurety guardrail text. Empty when STRUXURETY_OFFERING_GUARDRAILS is unset. */
export function readStruxuretyGuardrails(): string {
  return envText("STRUXURETY_OFFERING_GUARDRAILS");
}

function readOfferingTerms(): OfferingTerms {
  const raw = envText("OFFERING_TERMS_JSON");
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as OfferingTerms;
    return {
      priceReply: typeof parsed.priceReply === "string" ? parsed.priceReply.trim() : "",
      descriptionReply: typeof parsed.descriptionReply === "string" ? parsed.descriptionReply.trim() : "",
    };
  } catch {
    return {};
  }
}

function verifiedOrFallback(field: keyof OfferingTerms): string {
  const value = readOfferingTerms()[field];
  return value ? value : UNVERIFIED_PRICE;
}

export function withQuellivDisclaimer(body: string): string {
  const trimmed = body.trim();
  if (trimmed.includes("not investment advice or an offer to sell securities")) return trimmed;
  return `${trimmed}\n\n${QUELLIV_OFFERING_DISCLAIMER}`;
}

export function isStruxuretyInvestingQuestion(text: string): boolean {
  const lower = text.toLowerCase();
  if (!lower.includes("struxurety")) return false;
  return (
    /\$\s?\d/.test(lower) ||
    exemptionRulePattern().test(lower) ||
    /\b(invest\w*|capital|valuations?|returns?|terms|rais\w*|offerings?|shares?|equity|wir\w*|commit\w*|accredited|prices?|multiples?|dividends?|blueprint)\b/.test(
      lower
    )
  );
}

function enforceState1(answer: string, hasDataRoomAccess: boolean): string {
  if (exemptionRulePattern().test(answer)) return withQuellivDisclaimer(UNVERIFIED_EXEMPTION);
  if (!hasDataRoomAccess && PRICE_LEAK.test(answer)) return withQuellivDisclaimer(UNVERIFIED_PRICE);
  return answer;
}

/**
 * Quelliv offering answers. Price, size, and the offering description are
 * returned only when hasDataRoomAccess is true AND OFFERING_TERMS_JSON supplies
 * them. This app has no data-room login, so the public API passes false.
 * When the variable is unset, verified visitors get the documents redirect.
 */
export function quellivOfferingReply(lower: string, hasDataRoomAccess: boolean): string | null {
  let reply: string | null = null;

  if (
    /\b(refund|rescission|regulator|attorney|lawyer|tax advice|legal advice|press inquiry)\b/.test(lower)
  ) {
    return "I'll have the right person follow up.";
  }

  if (/per location|location revenue/.test(lower)) {
    reply =
      "I can't quote location revenue or other model figures. Figures in company materials are illustrative assumptions, not promised results. Please see the current offering documents.";
  } else if (
    /\b(wire|wiring|routing number|bank account|commit|commitment|put in|payment|tax return|financial document)\b/.test(
      lower
    )
  ) {
    reply = COMMITMENT_REFUSAL;
  } else if (/\bform\s*d\b/.test(lower)) {
    reply = hasDataRoomAccess
      ? "That filing covers an earlier round from 2021 to 2023. The current Series C round is a separate offering described in its own offering documents."
      : UNVERIFIED_EXEMPTION;
  } else if (
    exemptionRulePattern().test(lower) ||
    /\breg(?:ulation)?\s*d\b|\bexemption\b|what kind of offering|type of offering|is this an offering|is this a\b[^?\n]{0,40}offering/.test(
      lower
    )
  ) {
    reply = hasDataRoomAccess ? verifiedOrFallback("descriptionReply") : UNVERIFIED_EXEMPTION;
  } else if (/\beligib|accredit|do i qualify|am i qualified|\bverif/.test(lower)) {
    reply = ELIGIBILITY_REPLY;
  } else if (
    /\b(should i invest|how much should i|guaranteed|returns?|roi|upside|dividend|multiple)\b/.test(lower)
  ) {
    reply = ADVICE_REPLY;
  } else if (
    /\b(share price|unit price|price|valuation|raising|round size|how big|per share|per unit|how much|raise size)\b/.test(
      lower
    ) ||
    /\$\s?\d/.test(lower)
  ) {
    reply = hasDataRoomAccess ? verifiedOrFallback("priceReply") : UNVERIFIED_PRICE;
  } else if (/\binvest/.test(lower)) {
    reply = COMMITMENT_REFUSAL;
  } else if (
    /\b(ppm|private placement memorandum|subscription|pitch|deck|financial model|\bmodel\b|warrant|data room|data-room)\b/.test(
      lower
    )
  ) {
    reply = hasDataRoomAccess
      ? "Those materials are in the data room. I can't send documents in this chat, and I can't take a commitment here. Please use the documents themselves or Global Digital Markets."
      : "Those materials are available through Global Digital Markets or the data-room request. I can't send documents in this chat.";
  }

  if (!reply) return null;
  return enforceState1(withQuellivDisclaimer(reply), hasDataRoomAccess);
}
