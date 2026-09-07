export type LeadStatus =
  | "New"
  | "Engaged"
  | "Info Collected"
  | "Docs Sent"
  | "Doc Viewed"
  | "Meeting Booked"
  | "Handed Off"
  | "Opted Out"
  | "Closed";

export type LeadState =
  | "Interest Check"
  | "Collect Name"
  | "Collect Email"
  | "Collect Phone"
  | "Confirm Information"
  | "Delivery Preference"
  | "Send Documents"
  | "Schedule Follow-up"
  | "Resolved";

export type LeadSource = "landing_page" | "x" | "email" | "direct";
export type DeviceType = "Desktop" | "Mobile" | "Tablet";
export type Region = "Pacific" | "Central" | "East Coast" | "Mountain" | "Other";

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  state: LeadState;
  source: LeadSource;
  domain: string;
  device: DeviceType;
  region: Region;
  isTest: boolean;
  createdAt: string;
  updatedAt: string;
  utm?: UTMParams;
  consents?: ConsentRecord;
  conversationId?: string;
}

export interface ConsentRecord {
  accreditedAck: boolean;
  confidentialityAck: boolean;
  electronicDeliveryAck: boolean;
  aiDisclosureAck: boolean;
  securitiesAck: boolean;
  smsConsent: boolean;
  consentedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user" | "admin" | "system";
  content: string;
  createdAt: string;
}

export type ConversationMode = "AI Active" | "Admin" | "Escalated" | "Resolved";

export interface Conversation {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  mode: ConversationMode;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export type LogCategory = "chat" | "sms" | "email" | "voice" | "system" | "admin" | "api";
export type LogSeverity = "error" | "warn" | "info" | "debug";

export interface LogEntry {
  id: string;
  category: LogCategory;
  severity: LogSeverity;
  message: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "viewer";
  active: boolean;
  createdAt: string;
}

export interface Delivery {
  id: string;
  leadId: string;
  leadName: string;
  channel: "EMAIL" | "SMS";
  to: string;
  subject: string;
  preview: string;
  status: "sent" | "stuck" | "failed";
  createdAt: string;
}

export interface Pageview {
  id: string;
  path: string;
  referrer?: string;
  device: DeviceType;
  region: Region;
  utm?: UTMParams;
  sessionId: string;
  createdAt: string;
}

export interface ChatStart {
  id: string;
  sessionId: string;
  leadId?: string;
  createdAt: string;
}

export interface CampaignConfig {
  org: string;
  campaign: string;
  agentName: string;
  welcome: string;
  persona: string;
  conversationGuidance: string;
  stateGoals: Record<string, string>;
  knowledge: string;
  disclaimer: string;
  dataRoomUrl: string;
  videoUrl: string;
  colors: { primary: string; accent: string };
  landing: {
    heroTitle: string;
    heroSubtitle: string;
    ctaLabel: string;
    sections: { title: string; body: string }[];
    socialX: string;
    footer: string;
  };
  escalation: { email: string; sms: string };
  /** Twilio Messaging Service for A2P / voice DID pool (MS MGefe912…). */
  a2pMessagingServiceSid: string;
  /** Usa2p campaign id (QE2c6890… currently FAILED 30896 — do not enable SMS until VERIFIED). */
  a2pCampaignSid: string;
  a2pBrandStatus: "APPROVED" | "PENDING" | "FAILED";
  a2pCampaignStatus: "VERIFIED" | "FAILED" | "PENDING";
  /** Hard kill-switch: SMS outbound DISABLED until Usa2p campaign VERIFIED. Consent collection still OK. */
  SMS_OUTBOUND_ENABLED: boolean;
  voiceDidPoolNote: string;
}

export interface StoreData {
  leads: Lead[];
  conversations: Conversation[];
  logs: LogEntry[];
  users: AdminUser[];
  deliveries: Delivery[];
  pageviews: Pageview[];
  chatStarts: ChatStart[];
  config: CampaignConfig;
  sessions: Record<string, { userId: string; email: string; expiresAt: string }>;
}
