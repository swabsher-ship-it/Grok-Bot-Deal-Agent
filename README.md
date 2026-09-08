# Grok-Bot-Deal-Agent (Struxurety DealAgent v2)

Next.js App Router + TypeScript + Tailwind. Org **Struxurety**, campaign **Quelliv**, agent **Alex**.

**Ask Alex** is Quelliv's **in-room assistant and Data Room gatekeeper** (replaces legacy **Ask Vox** labeling). After consents and identity, Alex unlocks the live Quelliv Investor Preview / Data Room (video investor + Access Data Room / Book Conversation), then stays available for packet orientation.

Prospect UI matches live **https://investors.quelliv.com/** (white Montserrat landing, Learn More CTA, AI consent gate, floating chat). Admin remains a separate dark dashboard.

## Dual-link framing

| Role | URL |
|------|-----|
| **Alex gate / Ask Alex** (this app) | Deployed Deal Agent landing + `/start` chat gate |
| **Quelliv Investor Preview / Data Room** (unlock target) | https://v.quelliv.com/invest/989178b76cc2f3f0d734914f |

Canonical `config.dataRoomUrl` (seed default): `https://v.quelliv.com/invest/989178b76cc2f3f0d734914f`

Landing CTA: **Learn More** (opens Alex consent → chat)

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

No inventing investment returns. Do not push remotes without auth.
Target repo: Grok-Bot-Deal-Agent under swabsher-ship-it.
