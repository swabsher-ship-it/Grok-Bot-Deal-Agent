import type {
  AdminUser,
  CampaignConfig,
  Conversation,
  Delivery,
  Lead,
  LogEntry,
  Pageview,
  ChatStart,
  ChatMessage,
  StoreData,
  LeadStatus,
  LeadState,
  DeviceType,
  Region,
  LeadSource,
} from "./types";

const PASSWORD_HASH =
  "$2a$10$i90OkENJ7Uvwv8tADK.Af.MU6QiVNiel6/VCIWuDp6O2ZAcXJRv1."; // change-me

function isoDaysAgo(days: number, hour = 12): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, Math.floor(Math.random() * 50), 0, 0);
  return d.toISOString();
}

const namedLeads: Array<{
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  state: LeadState;
  isTest: boolean;
  daysAgo: number;
}> = [
  { name: "Test Investor", email: "test.investor@example.com", phone: "+15551234001", status: "Engaged", state: "Interest Check", isTest: true, daysAgo: 0 },
  { name: "Scott Absher", email: "scott.absher@quelliv.com", phone: "+15551234002", status: "Docs Sent", state: "Send Documents", isTest: true, daysAgo: 2 },
  { name: "Scott Absher", email: "scott.test@quelliv.com", phone: "+15551234003", status: "Docs Sent", state: "Send Documents", isTest: true, daysAgo: 5 },
  { name: "Doug Test", email: "doug.test@example.com", phone: "+15551234004", status: "Docs Sent", state: "Send Documents", isTest: true, daysAgo: 8 },
  { name: "Doug Moss", email: "doug.moss@example.com", phone: "+15551234005", status: "Docs Sent", state: "Send Documents", isTest: true, daysAgo: 10 },
  { name: "Mike Keyes", email: "mike.keyes@example.com", phone: "+15551234006", status: "Docs Sent", state: "Send Documents", isTest: true, daysAgo: 12 },
  { name: "Tom Ronk", email: "tom.ronk@example.com", phone: "+15551234007", status: "Docs Sent", state: "Send Documents", isTest: true, daysAgo: 15 },
  { name: "Mo Anderson", email: "mo@gmail.com", phone: "+18438120001", status: "Docs Sent", state: "Send Documents", isTest: true, daysAgo: 20 },
  { name: "RC Shades", email: "rc.shades@example.com", phone: "+15551234008", status: "Docs Sent", state: "Send Documents", isTest: true, daysAgo: 22 },
  { name: "Jordan Lee", email: "jordan.lee@example.com", phone: "+15551234009", status: "Engaged", state: "Collect Email", isTest: false, daysAgo: 3 },
  { name: "Priya Patel", email: "priya.patel@example.com", phone: "+15551234010", status: "Engaged", state: "Confirm Information", isTest: false, daysAgo: 4 },
  { name: "Chris Nguyen", email: "chris.nguyen@example.com", phone: "+15551234011", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 6 },
  { name: "Alex Rivera", email: "alex.rivera@example.com", phone: "+15551234012", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 7 },
  { name: "Sam Okonkwo", email: "sam.okonkwo@example.com", phone: "+15551234013", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 9 },
  { name: "Nina Brooks", email: "nina.brooks@example.com", phone: "+15551234014", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 11 },
  { name: "Omar Haddad", email: "omar.haddad@example.com", phone: "+15551234015", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 13 },
  { name: "Elena Rossi", email: "elena.rossi@example.com", phone: "+15551234016", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 14 },
  { name: "Blake Turner", email: "blake.turner@example.com", phone: "+15551234017", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 16 },
  { name: "Harper Quinn", email: "harper.quinn@example.com", phone: "+15551234018", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 18 },
  { name: "Devon Price", email: "devon.price@example.com", phone: "+15551234019", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 19 },
  { name: "Casey Kim", email: "casey.kim@example.com", phone: "+15551234020", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 21 },
  { name: "Riley Stone", email: "riley.stone@example.com", phone: "+15551234021", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 23 },
  { name: "Morgan Ellis", email: "morgan.ellis@example.com", phone: "+15551234022", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 24 },
  { name: "Jamie Fox", email: "jamie.fox@example.com", phone: "+15551234023", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 25 },
  { name: "Taylor Reed", email: "taylor.reed@example.com", phone: "+15551234024", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 26 },
  { name: "Avery Shaw", email: "avery.shaw@example.com", phone: "+15551234025", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 27 },
  { name: "Quinn Adler", email: "quinn.adler@example.com", phone: "+15551234026", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 28 },
  { name: "Drew Barnes", email: "drew.barnes@example.com", phone: "+15551234027", status: "Opted Out", state: "Resolved", isTest: true, daysAgo: 30 },
  { name: "Skyler West", email: "skyler.west@example.com", phone: "+15551234028", status: "Docs Sent", state: "Send Documents", isTest: false, daysAgo: 17 },
];

const devices: DeviceType[] = ["Desktop", "Mobile", "Tablet"];
const regions: Region[] = ["Pacific", "Central", "East Coast", "Mountain", "Other"];

function pickDevice(i: number): DeviceType {
  // ~30 desktop, ~28 mobile, 1 tablet for 59
  if (i === 0) return "Tablet";
  if (i % 2 === 0) return "Desktop";
  return "Mobile";
}

function pickRegion(i: number): Region {
  const weights = [30, 14, 13, 1, 1]; // Pacific, Central, East Coast, Mountain, Other
  const cum = [30, 44, 57, 58, 59];
  const idx = i % 59;
  for (let j = 0; j < cum.length; j++) {
    if (idx < cum[j]) return regions[j];
  }
  return "Pacific";
}

function domainFromEmail(email: string): string {
  const parts = email.split("@");
  return parts[1] || "";
}

export function buildSeedData(): StoreData {
  const leads: Lead[] = [];

  // Named leads (~29)
  namedLeads.forEach((n, i) => {
    const createdAt = isoDaysAgo(n.daysAgo, 10 + (i % 8));
    leads.push({
      id: `lead_named_${i + 1}`,
      name: n.name,
      email: n.email,
      phone: n.phone,
      status: n.status,
      state: n.state,
      source: "landing_page",
      domain: domainFromEmail(n.email),
      device: pickDevice(i),
      region: pickRegion(i),
      isTest: n.isTest,
      createdAt,
      updatedAt: createdAt,
      utm: i === 11 ? { utm_campaign: "series_c_launch", utm_source: "landing", utm_medium: "web" } : { utm_source: "landing", utm_medium: "web" },
      consents:
        n.status === "Docs Sent" || n.status === "Engaged"
          ? {
              accreditedAck: true,
              confidentialityAck: true,
              electronicDeliveryAck: true,
              aiDisclosureAck: true,
              securitiesAck: true,
              smsConsent: true,
              consentedAt: createdAt,
            }
          : undefined,
      conversationId: `conv_${i + 1}`,
    });
  });

  // One X inbound — Anonymous, never completed gate
  leads.push({
    id: "lead_x_1",
    name: "Anonymous",
    email: "",
    phone: "",
    status: "New",
    state: "Collect Name",
    source: "x",
    domain: "",
    device: "Mobile",
    region: "Pacific",
    isTest: false,
    createdAt: "2026-03-25T16:00:00.000Z",
    updatedAt: "2026-03-25T16:00:00.000Z",
    utm: { utm_source: "x", utm_medium: "social", utm_campaign: "series_c_launch" },
  });

  // Remaining Anonymous New / Collect Name to reach ~59
  const anonCount = 59 - leads.length;
  for (let i = 0; i < anonCount; i++) {
    const createdAt = isoDaysAgo(40 + i, 9 + (i % 10));
    leads.push({
      id: `lead_anon_${i + 1}`,
      name: "Anonymous",
      email: "",
      phone: "",
      status: "New",
      state: "Collect Name",
      source: i === 2 ? "email" : i === 5 ? "direct" : "landing_page",
      domain: "",
      device: pickDevice(namedLeads.length + 1 + i),
      region: pickRegion(namedLeads.length + 1 + i),
      isTest: i < 10,
      createdAt,
      updatedAt: createdAt,
      utm: i === 2 ? { utm_source: "email", utm_medium: "newsletter" } : { utm_source: "landing", utm_medium: "web" },
    });
  }

  // Conversations for engaged / docs sent / AI active (~10 AI Active)
  const conversations: Conversation[] = [];
  const aiActiveLeads = leads.filter(
    (l) => l.status === "Engaged" || (l.status === "Docs Sent" && l.conversationId)
  );
  let convIdx = 0;
  for (const lead of leads) {
    if (!lead.conversationId) continue;
    convIdx++;
    const mode =
      lead.status === "Opted Out"
        ? "Resolved"
        : convIdx <= 10
          ? "AI Active"
          : lead.status === "Docs Sent"
            ? "Resolved"
            : "AI Active";
    const msgs: ChatMessage[] = [
      {
        id: `msg_${lead.id}_1`,
        role: "assistant",
        content: `Hi — I'm Alex, Quelliv's Deal Agent. I can help you access the Investor Data Room once we capture your details and consents.`,
        createdAt: lead.createdAt,
      },
    ];
    if (lead.name !== "Anonymous" && lead.email) {
      msgs.push({
        id: `msg_${lead.id}_2`,
        role: "user",
        content: lead.name,
        createdAt: lead.createdAt,
      });
      msgs.push({
        id: `msg_${lead.id}_3`,
        role: "assistant",
        content: `Thanks, ${lead.name.split(" ")[0]}. What's the best email to send your data-room access link?`,
        createdAt: lead.createdAt,
      });
      if (lead.status === "Docs Sent" || lead.status === "Engaged") {
        msgs.push({
          id: `msg_${lead.id}_4`,
          role: "user",
          content: lead.email,
          createdAt: lead.createdAt,
        });
      }
    }
    // pad to ~8-9 avg messages for docs sent
    if (lead.status === "Docs Sent") {
      for (let m = 5; m <= 9; m++) {
        msgs.push({
          id: `msg_${lead.id}_${m}`,
          role: m % 2 === 0 ? "user" : "assistant",
          content:
            m % 2 === 0
              ? "Looking forward to reviewing the materials."
              : "Your private data-room link is ready. Ask me about the deck, model, PPM, or subscription process — I won't invent terms or returns.",
          createdAt: lead.createdAt,
        });
      }
    }
    conversations.push({
      id: lead.conversationId,
      leadId: lead.id,
      leadName: lead.name,
      leadPhone: lead.phone,
      mode: mode as Conversation["mode"],
      messages: msgs,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    });
  }

  const docsSent = leads.filter((l) => l.status === "Docs Sent");
  const deliveries: Delivery[] = docsSent.map((l, i) => ({
    id: `del_${i + 1}`,
    leadId: l.id,
    leadName: l.name,
    channel: i % 5 === 0 ? ("SMS" as const) : ("EMAIL" as const),
    to: i % 5 === 0 ? l.phone : l.email,
    subject: "Your Quelliv Investor Data Room Access",
    preview: `Hi ${l.name.split(" ")[0]}, Thanks for your interest in Quelliv! Here's your private link...`,
    status: "sent" as const,
    createdAt: l.updatedAt,
  }));

  const pageviews: Pageview[] = [];
  for (let i = 0; i < 340; i++) {
    pageviews.push({
      id: `pv_${i + 1}`,
      path: i % 7 === 0 ? "/start" : "/",
      referrer: i % 11 === 0 ? "https://x.com" : i % 13 === 0 ? "email" : undefined,
      device: pickDevice(i),
      region: pickRegion(i),
      utm:
        i % 11 === 0
          ? { utm_source: "x", utm_medium: "social", utm_campaign: "series_c_launch" }
          : { utm_source: "landing", utm_medium: "web" },
      sessionId: `sess_pv_${i + 1}`,
      createdAt: isoDaysAgo(i % 45, 8 + (i % 12)),
    });
  }

  const chatStarts: ChatStart[] = leads.slice(0, 45).map((l, i) => ({
    id: `cs_${i + 1}`,
    sessionId: `sess_chat_${i + 1}`,
    leadId: l.id,
    createdAt: l.createdAt,
  }));

  const users: AdminUser[] = [
    {
      id: "user_scott",
      name: "Scott Absher",
      email: "scott.absher@quelliv.com",
      passwordHash: PASSWORD_HASH,
      role: "admin" as const,
      active: true,
      createdAt: "2025-11-01T00:00:00.000Z",
    },
    {
      id: "user_doug",
      name: "Doug Moss",
      email: "doug.moss@quelliv.com",
      passwordHash: PASSWORD_HASH,
      role: "admin" as const,
      active: true,
      createdAt: "2025-11-15T00:00:00.000Z",
    },
    {
      id: "user_inactive",
      name: "Inactive Admin",
      email: "admin.inactive@quelliv.com",
      passwordHash: PASSWORD_HASH,
      role: "admin" as const,
      active: false,
      createdAt: "2025-12-01T00:00:00.000Z",
    },
  ];

  const logs: LogEntry[] = [
    {
      id: "log_1",
      category: "system",
      severity: "info",
      message: "DealAgent store seeded",
      createdAt: new Date().toISOString(),
    },
    {
      id: "log_2",
      category: "admin",
      severity: "info",
      message: "Seed admin users loaded",
      meta: { count: 3 },
      createdAt: isoDaysAgo(1),
    },
    {
      id: "log_3",
      category: "chat",
      severity: "info",
      message: "Gate conversation started",
      createdAt: isoDaysAgo(0, 14),
    },
    {
      id: "log_4",
      category: "email",
      severity: "info",
      message: "Data room access email queued",
      createdAt: isoDaysAgo(2),
    },
    {
      id: "log_5",
      category: "api",
      severity: "debug",
      message: "POST /api/pageview",
      createdAt: isoDaysAgo(0, 15),
    },
  ];

  const config: CampaignConfig = {
    org: "Struxurety",
    campaign: "Quelliv",
    agentName: "Alex",
    welcome:
      "Hi — I'm Alex, Quelliv's Deal Agent. I help accredited investors access the Investor Data Room and understand the document packet.",
    persona:
      "Alex is the Quelliv Investor Data Room gatekeeper and document guide for Struxurety's Quelliv campaign. Professional, clear, compliance-first. Never invents returns, valuations, or terms. Escalates securities questions to Scott Absher and Mike Keyes.",
    conversationGuidance:
      "Capture consents and identity before unlocking the data room. Explain deck → model overview → PPM → subscription order at a high level. Do not improvise legal effect. Collect SMS consent OK. Do NOT send SMS — SMS_OUTBOUND_ENABLED=false (Usa2p campaign FAILED 30896). Email-only for data-room delivery until campaign VERIFIED on MS MGefe912.",
    stateGoals: {
      "Interest Check": "Confirm investor interest in Quelliv materials",
      "Collect Name": "Capture full legal/contact name",
      "Collect Email": "Capture primary email",
      "Collect Phone": "Capture mobile phone (E.164 preferred)",
      "Confirm Information": "Confirm name, email, phone before delivery",
      "Delivery Preference": "Confirm email delivery of data-room link",
      "Send Documents": "Issue data-room unlock link",
      "Schedule Follow-up": "Offer book path with Scott / Mike when needed",
    },
    knowledge:
      "Quelliv investor packet categories: DECK (pitch), MODEL (financial model — orientation only), PPM (Private Placement Memorandum), SUB (Subscription Agreement), WARRANT, IRA path materials, BROKER_NOTICE, WHITEOBRIEF. Point to documents for terms; never invent returns.",
    disclaimer:
      "Informational only — not an offer to buy or sell securities. All offering terms are solely as set forth in the PPM and subscription documents. Past performance or illustrative models are not guarantees.",
    dataRoomUrl: "https://investors.quelliv.com/room?demo=1",
    videoUrl: "",
    colors: { primary: "#0b0d17", accent: "#8b5cf6" },
    landing: {
      heroTitle: "Quelliv Investor Data Room",
      heroSubtitle:
        "Meet Alex — your Deal Agent for document access, gatekeeping, and guidance through the Quelliv investor packet.",
      ctaLabel: "Start with Alex",
      sections: [
        {
          title: "Document mastery",
          body: "Alex knows the deck, model, PPM, subscription, and related materials — and the order investors typically review them.",
        },
        {
          title: "Access gate",
          body: "Name, email, mobile, and required permissions are captured before the room unlocks.",
        },
        {
          title: "Human escalation",
          body: "Accreditation, allocation, wire, and personalized return questions route to Scott Absher and Mike Keyes.",
        },
      ],
      socialX: "https://x.com/quelliv",
      footer:
        "© Quelliv · Struxurety DealAgent · Securities offered only by prospectus/PPM where applicable. Not investment advice.",
    },
    escalation: {
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
  };

  return {
    leads,
    conversations,
    logs,
    users,
    deliveries,
    pageviews,
    chatStarts,
    config,
    sessions: {},
  };
}
