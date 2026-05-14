# Backlog: Needs Credentials — AIHospiceCareManager

Stubbed in apply pass 5. Each route returns 503 with `missing_env` until the
listed env vars are populated. Hospice/PHI disclaimer is preserved on every
payload.

## Twilio — family check-in SMS
- **Endpoint:** `POST /api/integrations/twilio/family-checkin`
- **Env:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- **Wire-up TODO:** Send SMS via Twilio Messages API. Strip PHI from body
  before transmission; only send pre-templated, family-consented messages.

## SendGrid — bereavement / care-team email
- **Endpoint:** `POST /api/integrations/sendgrid/email`
- **Env:** `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
- **Wire-up TODO:** Use template IDs only; no PHI in dynamic fields without
  explicit care-team review.

## CMS — Medicare hospice claims
- **Endpoint:** `POST /api/integrations/cms/claims`
- **Env:** `CMS_API_BASE`, `CMS_API_KEY`, `CMS_NPI`
- **Wire-up TODO:** UB-04 form mapping; MBI validation; eligibility check
  before submission.

## Backlog items NOT mechanical (still deferred)

- **Pain management AI advisor** — TOO-RISKY without explicit medication
  safety workflow and physician sign-off step.
- **Agentic hospice care coordinator** — autonomy bounds must be set by
  product (NEEDS-PRODUCT-DECISION).
- **Legacy letter platform** — needs media storage + scheduled delivery
  infra (NEEDS-PRODUCT-DECISION + NEEDS-INFRA).
- **Grief stage detection** — NEEDS-PRODUCT-DECISION on signals + clinical
  validation.
