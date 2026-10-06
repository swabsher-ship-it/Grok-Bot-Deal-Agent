import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { initialAssistantMessage, nextGateReply, PUBLIC_GREETING, type GateSession } from "../src/lib/chat-engine";
import {
  QUELLIV_OFFERING_DISCLAIMER,
  QUELLIV_OFFERING_DESCRIPTION,
  QUELLIV_OFFERING_GUARDRAILS,
  STRUXURETY_INVESTING_REPLY,
  STRUXURETY_OFFERING_GUARDRAILS,
} from "../src/lib/offering-guardrails";
import { buildSeedData } from "../src/lib/seed";

const DISCLAIMER = QUELLIV_OFFERING_DISCLAIMER;
const loggedOut: GateSession = { step: "interest" };
const config = buildSeedData().config;
config.dataRoomUrl = "https://v.quelliv.com/invest/989178b76cc2f3f0d734914f";

function ask(question: string, access = false, session: GateSession = loggedOut) {
  return nextGateReply(session, question, config, access).reply;
}

const PRICE_Q = "What's the share price and how much are you raising?";
const EXEMPTION_Q = "Is this a 506(c) offering?";
const WIRE_Q = "I want to put in $50,000. Can I wire it today?";
const ELIGIBLE_Q = "Am I eligible to invest?";

const PRICE_A = `Terms are in the offering documents, available through Global Digital Markets or the data-room request. I can't share a price or the amount being raised without verified data-room access.\n\n${DISCLAIMER}`;
const EXEMPTION_A = `I can't discuss the exemption here. Details are available through Global Digital Markets or the data-room request once access is verified.\n\n${DISCLAIMER}`;
const WIRE_A = `You can invest only through the offering documents and Global Digital Markets. I can't take commitments, amounts, payments, wire details, or financial documents in this chat. I can connect you with Global Digital Markets or the data room.\n\n${DISCLAIMER}`;
const ELIGIBLE_A = `I can't determine whether you are eligible. Global Digital Markets handles eligibility, and you can also use the data-room request. Please don't send financial documents in this chat.\n\n${DISCLAIMER}`;

const STRUXURETY_Q = [
  "Can I invest in Struxurety?",
  "What's Struxurety's growth capital structure and valuation?",
  "What returns will I get if I put $100,000 into Struxurety?",
];
const STRUXURETY_A = `${STRUXURETY_INVESTING_REPLY} Please send your name and email.`;

function assertNoQuellivLeak(reply: string) {
  assert.doesNotMatch(reply, /506/);
  assert.doesNotMatch(reply, /\$\s?\d/);
  assert.doesNotMatch(reply, /10,000,000|10 million|\$5|500k|500,000|per location/i);
  assert.doesNotMatch(reply, /v\.quelliv\.com\/invest/);
  assert.doesNotMatch(reply, /general solicitation/i);
  assert.equal(reply.endsWith(DISCLAIMER), true);
}

test("legal blocks are loaded word for word and STATE 2 is not a reply path", () => {
  assert.match(QUELLIV_OFFERING_GUARDRAILS, /ACTIVE STATE: 1/);
  assert.match(QUELLIV_OFFERING_GUARDRAILS, /DO NOT ACTIVATE UNTIL LEGAL ANALYST CONFIRMS/);
  assert.ok(QUELLIV_OFFERING_GUARDRAILS.includes(DISCLAIMER));
  assert.equal(QUELLIV_OFFERING_DESCRIPTION, "a private placement under Regulation D for accredited investors");
  assert.match(STRUXURETY_OFFERING_GUARDRAILS, /ACTIVE STATE: 0 — NO ACTIVE OFFERING/);
  assert.ok(STRUXURETY_OFFERING_GUARDRAILS.includes(STRUXURETY_INVESTING_REPLY));
});

test("logged-out visitor: share price and amount being raised", () => {
  const reply = ask(PRICE_Q);
  assert.equal(reply, PRICE_A);
  assertNoQuellivLeak(reply);
  assert.doesNotMatch(reply, /private placement under Regulation D/);
});

test("logged-out visitor: 506(c) question does not name an exemption rule", () => {
  const reply = ask(EXEMPTION_Q);
  assert.equal(reply, EXEMPTION_A);
  assertNoQuellivLeak(reply);
  assert.doesNotMatch(reply, /private placement under Regulation D/);
});

test("logged-out visitor: wire and amount are refused", () => {
  const reply = ask(WIRE_Q);
  assert.equal(reply, WIRE_A);
  assertNoQuellivLeak(reply);
  assert.match(reply, /commitments, amounts, payments, wire details, or financial documents/);
  assert.match(reply, /Global Digital Markets/);
  assert.doesNotMatch(reply, /50,?000/);
});

test("logged-out visitor: eligibility goes to Global Digital Markets or the data room", () => {
  const reply = ask(ELIGIBLE_Q);
  assert.equal(reply, ELIGIBLE_A);
  assertNoQuellivLeak(reply);
  assert.match(reply, /Global Digital Markets/);
  assert.match(reply, /data-room request/);
});

test("verified data-room access may describe the offering and state price and size", () => {
  const price = ask(PRICE_Q, true);
  assert.match(price, /Units are \$5 each/);
  assert.match(price, /up to \$10 million/);
  assert.doesNotMatch(price, /506/);
  assert.equal(price.endsWith(DISCLAIMER), true);

  const exemption = ask(EXEMPTION_Q, true);
  assert.match(exemption, new RegExp(QUELLIV_OFFERING_DESCRIPTION));
  assert.doesNotMatch(exemption, /506/);
  assert.doesNotMatch(exemption, /general solicitation/i);
});

test("location revenue is not quoted", () => {
  const reply = ask("What is the $500k per location revenue?");
  assert.doesNotMatch(reply, /500/);
  assert.doesNotMatch(reply, /\$/);
  assert.equal(reply.endsWith(DISCLAIMER), true);
});

test("public greeting ignores admin welcome copy", () => {
  const poisoned = { ...config, welcome: "Explore an investment in Quelliv. The offering price is $5." };
  assert.equal(initialAssistantMessage(poisoned), PUBLIC_GREETING);
  assert.doesNotMatch(PUBLIC_GREETING, /\binvest|\boffering|\$\s*\d/i);
});

test("access request does not reveal an offering link", () => {
  const result = nextGateReply(
    { step: "confirm", name: "Ada Lovelace", email: "ada@example.com", phone: "+15551234001" },
    "confirm",
    config,
    false
  );
  assert.equal(result.unlock, false);
  assert.doesNotMatch(result.reply, /\binvest|\boffering|v\.quelliv\.com|\$\s*\d/i);
});

test("Struxurety investing questions use the STATE 0 reply and capture name and email only", () => {
  for (const question of STRUXURETY_Q) {
    const first = nextGateReply(loggedOut, question, config, false);
    assert.equal(first.reply, STRUXURETY_A);
    assert.doesNotMatch(first.reply, /growth capital|capital structure|valuation|returns|\$\s*\d|506|private placement/i);
    assert.doesNotMatch(first.reply, /not investment advice or an offer to sell securities/);
    assert.equal(first.session.struxuretyInterest?.phase, "contact");

    const noted = nextGateReply(first.session, "Jordan Lee jordan@example.com", config, false);
    assert.equal(
      noted.reply,
      "Thanks, Jordan Lee. I've noted your interest and Scott's team will follow up at jordan@example.com."
    );
    assert.equal(noted.leadPatch?.name, "Jordan Lee");
    assert.equal(noted.leadPatch?.email, "jordan@example.com");
    assert.equal(noted.leadPatch?.phone, undefined);
    assert.doesNotMatch(noted.reply, /growth capital|valuation|returns|\$\s*\d|506|wire|private placement/i);
    assert.equal(noted.session.struxuretyInterest?.phase, "done");
  }
});

test("public pages have no investment, offering, price, or size language", () => {
  const files = [
    "src/app/page.tsx",
    "src/app/layout.tsx",
    "src/app/start/page.tsx",
    "src/app/terms/page.tsx",
    "src/app/privacy/page.tsx",
    "src/components/chat/ChatWidget.tsx",
    "src/components/landing/ProspectHeader.tsx",
    "src/components/landing/ProspectFooter.tsx",
    "README.md",
  ];
  const forbidden = /\binvest|\boffering\b|\$\s*\d|\b506\b|v\.quelliv\.com\/invest|investors\.quelliv\.com/i;
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    assert.doesNotMatch(text, forbidden, file);
  }
});

test("chat route does not return a data-room url from the client", () => {
  const route = readFileSync("src/app/api/chat/route.ts", "utf8");
  assert.match(route, /nextGateReply\(gate, message, store\.config, false\)/);
  assert.doesNotMatch(route, /dataRoomUrl/);
});
