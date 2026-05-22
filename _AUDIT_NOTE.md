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

## Apply pass 6 (close-out)

Three LLM-only, safe-variant endpoints appended to `server/routes/ai.js` (same auth + global aiRateLimiter + `callOpenRouter` + `logPHIAccess` + `parseStructured` house style). Every response carries `disclaimer: "Clinical decision support only — verify with care team before acting"`.

Items:
- `POST /api/ai/pain-management-advisor` — explicitly labeled "clinical decision support, not a prescription"; `requires_md_review` defaults to true when the LLM omits it.
- `POST /api/ai/grief-stage-detection` — screening-level only; flags complicated-grief indicators; suggests follow-up window.
- `POST /api/ai/advance-care-planning-summary` — stateless; produces chart summary, family conversation starter, document outlines, and gaps_to_address.

File: `server/routes/ai.js` (append-only, no new deps, no schema changes, no `.env` edits, no FE).

Syntax: `node --check server/routes/ai.js` PASS.

Remaining backlog:
- TOO-RISKY: autonomy-bounded agentic hospice care coordinator (skipped this pass).
- NEEDS-STORAGE+SCHEDULING: legacy letter platform (recording + scheduled delivery infrastructure).
- NEEDS-PRODUCT-DECISION: volunteer/chaplain scheduling engine.
