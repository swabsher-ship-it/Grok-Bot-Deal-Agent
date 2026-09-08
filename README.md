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

## A2P / SMS
SMS_OUTBOUND_ENABLED=false (hard kill-switch).
a2pMessagingServiceSid=MGefe912
a2pCampaignSid=QE2c6890 status FAILED (code 30896). Brand APPROVED.
Collect SMS consent OK. Do not send SMS until Usa2p campaign VERIFIED on that Messaging Service.
Voice DID pool: plan from 9 numbers on MS MGefe912. Guard in src/lib/sms.ts.

## Routes
Public: / /start /terms /privacy
Admin: /admin /admin/leads /admin/conversations /admin/logs /admin/users /admin/config /admin/voice
APIs: /api/pageview /api/chat/start /api/chat /api/consent /api/admin/*

No inventing investment returns. Do not push remotes without auth.
Target repo: Grok-Bot-Deal-Agent under swabsher-ship-it.
