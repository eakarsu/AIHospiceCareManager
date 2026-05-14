/*
 * routes/integrations.js — Apply pass 5
 *
 * 503-on-no-key stubs for third-party integrations called out in
 * batch_04 §24 ("Gaps — missing non-AI features" + "Custom feature
 * suggestions" for AIHospiceCareManager). All endpoints require JWT auth via
 * the existing auth middleware. None modify existing schema, routes, or
 * authentication.
 *
 * NOTE: Hospice context — care-team disclaimer is preserved on every payload
 * to keep the project's HIPAA/PHI posture intact.
 */

const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

const PHI_REMINDER = 'For care-team internal use only. Do not transmit PHI to unconfigured integrations.';

function requireEnv(req, res, providerName, vars) {
  const missing = vars.filter((v) => !process.env[v] || process.env[v].startsWith('your_'));
  if (missing.length) {
    res.status(503).json({
      error: 'integration_not_configured',
      provider: providerName,
      missing_env: missing,
      disclaimer: PHI_REMINDER,
      message: `${providerName} is not configured. Set ${missing.join(', ')} to enable this endpoint.`,
    });
    return false;
  }
  return true;
}

// Twilio SMS for family check-ins
router.post('/twilio/family-checkin', auth, async (req, res) => {
  if (!requireEnv(req, res, 'Twilio', [
    'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER',
  ])) return;
  res.json({
    status: 'stub_with_creds',
    note: 'Twilio creds present but wire-up TODO; do not transmit PHI in body.',
    disclaimer: PHI_REMINDER,
  });
});

// SendGrid for bereavement / care-team email reminders
router.post('/sendgrid/email', auth, async (req, res) => {
  if (!requireEnv(req, res, 'SendGrid', ['SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'])) return;
  res.json({
    status: 'stub_with_creds',
    note: 'SendGrid configured but wire-up TODO. PHI redaction required at composition layer.',
    disclaimer: PHI_REMINDER,
  });
});

// CMS / Medicare claims submission (CMS_API_BASE, CMS_API_KEY, NPI)
router.post('/cms/claims', auth, async (req, res) => {
  if (!requireEnv(req, res, 'CMS', ['CMS_API_BASE', 'CMS_API_KEY', 'CMS_NPI'])) return;
  res.json({
    status: 'stub_with_creds',
    note: 'CMS endpoint reachable; wire-up TODO. Hospice claims require validated MBI + UB-04.',
    disclaimer: PHI_REMINDER,
  });
});

module.exports = router;
