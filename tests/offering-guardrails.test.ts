import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { initialAssistantMessage, nextGateReply, PUBLIC_GREETING, type GateSession } from "../src/lib/chat-engine";
import { QUELLIV_OFFERING_DISCLAIMER, readQuellivGuardrails } from "../src/lib/offering-guardrails";
import { buildSeedData } from "../src/lib/seed";

const DISCLAIMER = QUELLIV_OFFERING_DISCLAIMER;
const loggedOut: GateSession = { step: "interest" };
const config = buildSeedData().config;
config.dataRoomUrl = "https://example.invalid/invest/DUMMY";

/** Exemption-rule digits, so this file does not spell the rule. */
const ruleNumber = String.fromCharCode(53, 48, 54);
const rulePattern = new RegExp(ruleNumber);

function ask(question: string, access = false, session: GateSession = loggedOut) {
  return nextGateReply(session, question, config, access).reply;
}

const PRICE_Q = "What's the share price and how much are you raising?";
const EXEMPTION_Q = `Is this a ${ruleNumber}(c) offering?`;
const WIRE_Q = "I want to put in funds. Can I wire it today?";
const ELIGIBLE_Q = "Am I eligible to invest?";

const PRICE_A = `Terms are in the offering documents, available through Global Digital Markets or the data-room request. I can't share a price or the amount being raised without verified data-room access.\n\n${DISCLAIMER}`;
const EXEMPTION_A = `I can't discuss the exemption here. Details are available through Global Digital Markets or the data-room request once access is verified.\n\n${DISCLAIMER}`;
const WIRE_A = `You can invest only through the offering documents and Global Digital Markets. I can't take commitments, amounts, payments, wire details, or financial documents in this chat. I can connect you with Global Digital Markets or the data room.\n\n${DISCLAIMER}`;
const ELIGIBLE_A = `I can't determine whether you are eligible. Global Digital Markets handles eligibility, and you can also use the data-room request. Please don't send financial documents in this chat.\n\n${DISCLAIMER}`;

function assertNoQuellivLeak(reply: string) {
  assert.doesNotMatch(reply, rulePattern);
  assert.doesNotMatch(reply, /\$\s?\d/);
  assert.doesNotMatch(reply, /\bmillion\b|per location/i);
  assert.doesNotMatch(reply, /v\.quelliv\.com/);
  assert.equal(reply.endsWith(DISCLAIMER), true);
}

test("guardrail text is empty unless the environment supplies it", () => {
  const prevQuelliv = process.env.QUELLIV_OFFERING_GUARDRAILS;
  try {
    delete process.env.QUELLIV_OFFERING_GUARDRAILS;
    assert.equal(readQuellivGuardrails(), "");

    process.env.QUELLIV_OFFERING_GUARDRAILS = "QUELLIV_GUARDRAIL_SENTINEL";
    assert.equal(readQuellivGuardrails(), "QUELLIV_GUARDRAIL_SENTINEL");
  } finally {
    if (prevQuelliv === undefined) delete process.env.QUELLIV_OFFERING_GUARDRAILS;
    else process.env.QUELLIV_OFFERING_GUARDRAILS = prevQuelliv;
  }
});

test("logged-out visitor: share price and amount being raised", () => {
  const reply = ask(PRICE_Q);
  assert.equal(reply, PRICE_A);
  assertNoQuellivLeak(reply);
  assert.doesNotMatch(reply, /private placement under Regulation D/);
});

test("logged-out visitor: named exemption question does not repeat the rule", () => {
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
});

test("logged-out visitor: eligibility goes to Global Digital Markets or the data room", () => {
  const reply = ask(ELIGIBLE_Q);
  assert.equal(reply, ELIGIBLE_A);
  assertNoQuellivLeak(reply);
  assert.match(reply, /Global Digital Markets/);
  assert.match(reply, /data-room request/);
});

test("verified access reads term replies from the environment, or uses the documents fallback", () => {
  const previous = process.env.OFFERING_TERMS_JSON;
  try {
    delete process.env.OFFERING_TERMS_JSON;
    assert.equal(ask(PRICE_Q, true), PRICE_A);
    assert.equal(ask(EXEMPTION_Q, true), PRICE_A);

    process.env.OFFERING_TERMS_JSON = JSON.stringify({
      priceReply: "RUNTIME_PRICE_SENTINEL",
      descriptionReply: "RUNTIME_DESCRIPTION_SENTINEL",
    });
    const price = ask(PRICE_Q, true);
    assert.match(price, /RUNTIME_PRICE_SENTINEL/);
    assert.equal(price.endsWith(DISCLAIMER), true);
    assert.doesNotMatch(ask(PRICE_Q, false), /RUNTIME_PRICE_SENTINEL/);

    const described = ask(EXEMPTION_Q, true);
    assert.match(described, /RUNTIME_DESCRIPTION_SENTINEL/);
    assert.equal(described.endsWith(DISCLAIMER), true);
    assert.equal(ask(EXEMPTION_Q, false), EXEMPTION_A);
    assert.doesNotMatch(ask(EXEMPTION_Q, false), /RUNTIME_DESCRIPTION_SENTINEL/);
  } finally {
    if (previous === undefined) delete process.env.OFFERING_TERMS_JSON;
    else process.env.OFFERING_TERMS_JSON = previous;
  }
});

test("location revenue is not quoted", () => {
  const reply = ask("What is the revenue per location?");
  assert.doesNotMatch(reply, rulePattern);
  assert.doesNotMatch(reply, /\$/);
  assert.doesNotMatch(reply, /per location revenue is/i);
  assert.equal(reply.endsWith(DISCLAIMER), true);
});

test("public greeting ignores admin welcome copy", () => {
  const poisoned = { ...config, welcome: "Explore an investment in Quelliv." };
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
  assert.doesNotMatch(result.reply, /\binvest|\boffering|example\.invalid|v\.quelliv\.com|\$\s*\d/i);
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
  const forbidden = new RegExp(
    `\\binvest|\\boffering\\b|\\$\\s*\\d|\\b${ruleNumber}\\b|v\\.quelliv\\.com\\/invest|investors\\.quelliv\\.com`,
    "i"
  );
  const envNames = ["OFFERING_TERMS_JSON", "QUELLIV_OFFERING_GUARDRAILS"];
  for (const file of files) {
    let text = readFileSync(file, "utf8");
    if (file === "README.md") {
      for (const name of envNames) text = text.split(name).join("ENV_VAR");
    }
    assert.doesNotMatch(text, forbidden, file);
  }
});

test("chat route does not return a data-room url from the client", () => {
  const route = readFileSync("src/app/api/chat/route.ts", "utf8");
  assert.match(route, /nextGateReply\(gate, message, store\.config, false\)/);
  assert.doesNotMatch(route, /dataRoomUrl/);
});

test("committed sources do not contain the live link or term figures", () => {
  const files = [
    "src/lib/offering-guardrails.ts",
    "src/lib/chat-engine.ts",
    "src/lib/seed.ts",
    "README.md",
    "tests/offering-guardrails.test.ts",
  ];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    assert.equal(text.includes(ruleNumber), false, file);
    assert.doesNotMatch(text, /v\.quelliv\.com/);
  }
});
