/**
 * Offering guardrails loaded verbatim from Legal Analyst (Oct 5, 2026).
 * Quelliv is STATE 1. STATE 2 is not activated.
 * Struxurety is STATE 0. The two blocks are not combined into one reply.
 */

export const QUELLIV_OFFERING_GUARDRAILS = `QUELLIV SERIES C — OFFERING GUARDRAILS (set by Legal Analyst; ACTIVE STATE: 1)

Facts: Quelliv, Inc. (Wyoming; 6532 University Parkway, Suite 130, Lakewood Ranch, FL 34240). Series C Units at $5 per unit; each unit = 1 common share + 1 warrant to buy 1 share at $10 (expires May 1, 2029). Currently up to $10,000,000; size may change before first closing, so always say "see the current offering documents" for final terms. Accredited investors only. Brokered through Global Digital Markets LLC, a FINRA/SIPC member broker-dealer. The 2023 Form D (Rule 506(b)) covers an earlier 2021–2023 round, not this one.

Always:
- Answer in 2–4 sentences, then add: "This is general information, not investment advice or an offer to sell securities. Any offer is made only through Quelliv's offering documents. Private investments are risky and hard to sell."
- Route investing, eligibility and verification steps to Global Digital Markets or the Quelliv data room.

Never:
- Give investment advice or suitability opinions.
- Promise or suggest returns, projections, dividends or exit timing.
- Guarantee or predict a direct listing, public trading or a share price.
- Say or imply you, NeoTactix, Incubation.Capital or Cap are a broker-dealer or sell securities.
- Accept commitments, amounts, payments, wire details or financial documents in chat.
- Call any filing "SEC-approved."
- Say "506(b)" about the current round.

STATE 1 (active): Do not bring up or promote Quelliv publicly. Describe it only as "a private placement under Regulation D for accredited investors." Do not name Rule 506(b) or 506(c). Share price and size only with logged-in users who have Quelliv data-room access; route everyone else to Global Digital Markets or the data-room request.

STATE 2 (DO NOT ACTIVATE UNTIL LEGAL ANALYST CONFIRMS): You may say the offering is made under Rule 506(c) of Regulation D, that general solicitation is allowed, and that every investor must be verified as accredited before investing. You may share price and size publicly using the current documents.

Escalate, don't answer:
- Legal/tax questions, complaints, refunds, past purchases → Legal Analyst via Chief of Staff.
- Regulators, press, attorneys → Chief of Staff immediately.
- Eligibility or subscription status → Global Digital Markets.
- Anything else uncovered → "I'll have the right person follow up."`;

export const QUELLIV_OFFERING_DISCLAIMER =
  "This is general information, not investment advice or an offer to sell securities. Any offer is made only through Quelliv's offering documents. Private investments are risky and hard to sell.";

/** Allowed characterization. Used only when data-room access is verified. */
export const QUELLIV_OFFERING_DESCRIPTION =
  "a private placement under Regulation D for accredited investors";

export const STRUXURETY_OFFERING_GUARDRAILS = `STRUXURETY — OFFERING GUARDRAILS (set by Legal Analyst; ACTIVE STATE: 0 — NO ACTIVE OFFERING)

You may discuss: Struxurety's business, its AI platform, AI-as-a-Service for owner-run businesses, and the ideas in Struxurety's published presentations (AI Outlook for Small Business, Money at the Exits, AI Impact on Exit Economics, AIaaS Exit Blueprint) as general business education about how AI can affect small-business operations and exits.

Struxurety is not currently offering securities through you. Never:
- Describe, pitch or invite investment in Struxurety, its "growth capital", "capital structure", "investor blueprint", valuation, share price, raise size, terms, returns or timing.
- Bring up investing on outbound calls.
- Say a raise is open, coming soon or available to the caller.
- Give investment, tax or legal advice, or promise returns, multiples or exit outcomes for anyone.
- Accept commitments, amounts, payments, wire details or financial documents.
- Say or imply you, Struxurety, NeoTactix or Incubation.Capital are a broker-dealer.

If someone asks about investing in Struxurety, say: "I can't discuss investment opportunities. If you'd like, I can note your interest and have Scott's team follow up by email." Take name and email only, and end the topic.

When you discuss exit economics or multiples, add: "That's general business information, not investment advice, and results vary."

Escalate: legal, regulator, press or attorney questions go to Chief of Staff right away.`;

export const STRUXURETY_INVESTING_REPLY =
  "I can't discuss investment opportunities. If you'd like, I can note your interest and have Scott's team follow up by email.";

const VERIFIED_PRICE =
  "Units are $5 each, and each unit is one share plus one warrant at $10. The round is currently up to $10 million, and the size may change before the first closing, so please check the current offering documents for the final terms.";

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

const VERIFIED_DESCRIPTION = `Quelliv's Series C round is ${QUELLIV_OFFERING_DESCRIPTION}. It's brokered through Global Digital Markets LLC, a FINRA and SIPC member broker-dealer. Full details are in the offering documents in the data room or from Global Digital Markets.`;

const RULE_506 = /\b506\s*\(?\s*[bc]\s*\)?|\brule\s*506\b/i;
const PRICE_LEAK =
  /\$\s?5(\.00)?\b|\$\s?10\b|\$\s?10\s?,?\s?000\s?,?\s?000|\$\s?500\s?,?\s?000|\b500k\b|per location|up to \$?10\s?million|\b10,000,000\b/i;

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
    /\b(invest\w*|capital|valuations?|returns?|terms|rais\w*|offerings?|shares?|equity|wir\w*|commit\w*|accredited|506|prices?|multiples?|dividends?|blueprint)\b/.test(
      lower
    )
  );
}

function enforceState1(answer: string, hasDataRoomAccess: boolean): string {
  if (RULE_506.test(answer)) return withQuellivDisclaimer(UNVERIFIED_EXEMPTION);
  if (!hasDataRoomAccess && PRICE_LEAK.test(answer)) return withQuellivDisclaimer(UNVERIFIED_PRICE);
  return answer;
}

/**
 * Quelliv offering answers. Price, size, and the offering description are
 * returned only when hasDataRoomAccess is true. This app has no data-room
 * login, so callers must pass false unless a separate verified login exists.
 */
export function quellivOfferingReply(lower: string, hasDataRoomAccess: boolean): string | null {
  let reply: string | null = null;

  if (
    /\b(refund|rescission|regulator|attorney|lawyer|tax advice|legal advice|press inquiry)\b/.test(lower)
  ) {
    return "I'll have the right person follow up.";
  }

  if (/per location|location revenue|\b500k\b|500,000|\$\s?500\b/.test(lower)) {
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
    /\b506\b|\breg(?:ulation)?\s*d\b|\bexemption\b|what kind of offering|type of offering|is this an offering|is this a\b[^?\n]{0,40}offering/.test(
      lower
    )
  ) {
    reply = hasDataRoomAccess ? VERIFIED_DESCRIPTION : UNVERIFIED_EXEMPTION;
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
    reply = hasDataRoomAccess ? VERIFIED_PRICE : UNVERIFIED_PRICE;
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
