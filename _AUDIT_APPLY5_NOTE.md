# Apply Pass 5 — AIHospiceCareManager

**Date:** 2026-05-08
**Project:** AIHospiceCareManager
**Stack:** Node-Express + React, Sequelize ORM, JWT bearer auth, hospice/PHI
disclaimers preserved on all AI/integration outputs.
**Audit source:** `/Users/erolakarsu/projects/_AUDIT/reports/batch_04.md` §24

## Verified-present (no changes)

Pass 1-4 already implemented every audit-flagged AI counterpart and a robust
9-endpoint AI suite plus the two added in pass 2:
- `/care-plan-narrative`, `/family-communication`, `/symptom-recommendations`,
  `/bereavement-resources`, `/meeting-summary`, `/compliance-documentation`,
  `/comfort-measures`, `/predictive-decline`, `/bereavement-contact`,
  `/advance-directive-summarizer`, `/family-meeting-agenda-generator`.
- AI rate limiter mounted inside `routes/ai.js` (`router.use(aiRateLimiter)`).
- HIPAA `logPHIAccess` audit logging on every AI endpoint.

## Implemented this pass (5 items — at cap)

1. `POST /api/integrations/twilio/family-checkin` — 503-on-no-key (Twilio).
2. `POST /api/integrations/sendgrid/email` — 503-on-no-key (SendGrid).
3. `POST /api/integrations/cms/claims` — 503-on-no-key (CMS Medicare).
4. `GET  /api/coordination/visit-conflicts` — mechanical overlap detector
   across scheduled `Visit` records (Sequelize, defensive on schema fields).
5. `GET  /api/coordination/volunteer-match/:patientId` — rule-based scoring
   (skills overlap + zip-prefix + background check + activity sweet spot).

Files written:
- `server/routes/integrations.js` (new)
- `server/routes/coordination.js` (new)
- `server/index.js` (added 4 lines: 2 requires, 2 `app.use`)
- `_BACKLOG_NEEDS_CREDS.md` (new)

## Categorization of remaining backlog

- **NEEDS-CREDS (stubbed):** Twilio, SendGrid, CMS.
- **MECHANICAL (implemented):** visit conflict detection, volunteer matching.
- **TOO-RISKY:** pain management advisor, agentic care coordinator (require
  explicit medication-safety + autonomy-bounds product decisions).
- **NEEDS-PRODUCT-DECISION:** legacy letter delivery cadence, grief-stage
  signal selection, autonomous reminder cadence.

## Smoke test outcome

`node --check` passes for all 3 modified/new files. New endpoints inherit
existing auth middleware. Hospice PHI disclaimer present in every payload
returned by integrations.js.

Boot smoke not run (Sequelize requires live DB credentials per `.env`); files
are additive and the existing model imports already resolve in `models/`.

## Cap

5 / 5 — no further additions this pass.
