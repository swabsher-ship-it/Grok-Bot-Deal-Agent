# Grok-Bot-Deal-Agent (Struxurety DealAgent v2)

Next.js App Router + TypeScript + Tailwind. Org **Struxurety**, campaign **Quelliv**, agent **Alex**.

**Ask Alex** takes a request for access and answers general questions about Quelliv. The public site does not link into a private round. Admin remains a separate dashboard.

Landing CTA: **Request access** (opens Alex consent, then chat)

## Server-only terms

These variables are unset by default. Leave them unset in source control. Set them only on the server. When they are unset, chat does not state terms.

| Variable | Purpose |
|---|---|
| `QUELLIV_OFFERING_GUARDRAILS` | Full Quelliv guardrail text. Empty when unset. |
| `OFFERING_TERMS_JSON` | JSON object. Optional string fields: `priceReply`, `descriptionReply`. |

`OFFERING_TERMS_JSON` is read only for a caller that already has verified data-room access. This app's public chat never sets that flag. If the variable or a field is missing, the reply is: terms are in the documents, available through Global Digital Markets or the data-room request.

## Quick start
Use package.json scripts: install, build, then dev. Open localhost:3000

## Seed admin
scott.absher@quelliv.com with the default seed password documented in package notes (change-me).

## Durable storage (Cloud Run)

By default the app persists to local `data/store.json` (ephemeral on Cloud Run).

For production durability, set a GCS bucket env var on the Cloud Run service (Application Default Credentials are used automatically):

```bash
# Either name works:
GCS_BUCKET=your-alex-data-bucket
# or
ALEX_DATA_BUCKET=your-alex-data-bucket
```

When set, the app:
- Reads/writes `store.json` in that bucket (leads, conversations, events, sessions, config)
- Optionally appends analytics lines to `events/YYYY-MM-DD.ndjson` for cheap export

Grant the Cloud Run runtime service account `roles/storage.objectAdmin` (or objectCreator + objectViewer) on the bucket.

Phase 1 uses a single GCS JSON file — no Firestore required.

## Analytics events

Append-only `events[]` in the store (+ NDJSON in GCS). Client assigns:
- `visitorId` cookie (~1 year, `dealagent_vid`)
- `sessionId` (sessionStorage / `dealagent_sid`)

Tracked types: `pageview`, `chat_launcher_open`, `learn_more_click`, `consent_checked`, `chat_start`, `gate_step` (name|email|phone|sms_consent|confirm), `unlock`, `data_room_click`, `message_in`, `message_out`, `admin_login`, `takeover`, `resolve`.

Admin CSV exports: `/api/admin/export/leads` and `/api/admin/export/events`.

## A2P / SMS
SMS_OUTBOUND_ENABLED=false (hard kill-switch).
a2pMessagingServiceSid=MGefe912
a2pCampaignSid=QE2c6890 status FAILED (code 30896). Brand APPROVED.
Collect SMS consent OK. Do not send SMS until Usa2p campaign VERIFIED on that Messaging Service.
Voice DID pool: plan from 9 numbers on MS MGefe912. Guard in src/lib/sms.ts.

## Routes
Public: / /start /terms /privacy
Admin: /admin /admin/leads /admin/conversations /admin/logs /admin/users /admin/config /admin/voice
APIs: /api/pageview /api/events /api/chat/start /api/chat /api/consent /api/admin/* /api/admin/export/leads /api/admin/export/events

Do not push remotes without auth.
Target repo: Grok-Bot-Deal-Agent under swabsher-ship-it.
