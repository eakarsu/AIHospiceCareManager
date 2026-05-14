# Audit Apply Notes — AIHospiceCareManager

## Source
`/Users/erolakarsu/projects/_AUDIT/reports/batch_04.md` section 24.

## Original Recommendations (AI Counterparts)
- `/advance-directive-summarizer`
- `/family-meeting-agenda-generator`

## Implemented (this pass)
Two new endpoints appended to `server/routes/ai.js`, following existing pattern (auth + global aiRateLimiter on the router, `callOpenRouter`, PHI audit logging via `logPHIAccess`, structured JSON parse via `parseStructured`):

- `POST /api/ai/advance-directive-summarizer` — concise summary of resuscitation, intubation, nutrition/hydration, antibiotics, transfer preferences with explicit ambiguity flags.
- `POST /api/ai/family-meeting-agenda-generator` — patient-tailored agenda with timed topics, lead clinician, family questions, decisions, and tone guidance.

Both write to AuditLog through `logPHIAccess` for HIPAA compliance.

Syntax: `node --check` passes.

## Backlog (Custom Feature Suggestions)
- Agentic hospice care coordinator (autonomy must be carefully bounded — TOO-RISKY mechanically).
- Legacy letter platform (recording + scheduled delivery — needs storage and delivery infrastructure).
- Pain management AI advisor (needs medication safety review workflow).
- Grief stage detection + adaptive support.
- Volunteer + chaplain scheduling engine.
- Advance care planning support (could use new summarizer endpoint as a building block).

## Categorization
- MECHANICAL: 2 endpoints (done — exhausts the audit's missing list).
- TOO-RISKY mechanically: medication-adjusting agents, autonomous coordinator.
- NEEDS-PRODUCT-DECISION: legacy letter delivery cadence, grief-stage detection signals.

## Apply pass 3 (frontend)

LEFT-AS-IS. Both apply-pass-2 endpoints (`/api/ai/advance-directive-summarizer`, `/api/ai/family-meeting-agenda-generator`) are already wired in `client/src/pages/AdvancedAITools.js` and registered in `App.js` — JWT taken from `localStorage.token` and passed as `Bearer`. Older AI endpoints wired via `FeaturePage.js` + `AIPanel`. Idempotent; no changes made.
