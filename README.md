# Grok-Bot-Deal-Agent (Struxurety DealAgent v2)

Next.js App Router + TypeScript + Tailwind. Org Struxurety, campaign Quelliv, agent Alex.

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
Public: / /start
Admin: /admin /admin/leads /admin/conversations /admin/logs /admin/users /admin/config /admin/voice
APIs: /api/pageview /api/chat/start /api/chat /api/consent /api/admin/*

No inventing investment returns. Do not push remotes without auth.
Target repo: Grok-Bot-Deal-Agent under swabsher-ship-it.
