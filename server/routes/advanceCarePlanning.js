// Advance care planning co-pilot guiding directive creation with
// state-specific templates.
// Audit: batch_04.md / AIHospiceCareManager / Custom Feature Suggestions #6
const express = require('express');
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const { Patient, AuditLog } = require('../models');

const router = express.Router();
router.use(auth);

async function callAI(systemPrompt, userPrompt) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'X-Title': 'Hospice - Advance Care Planning'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, max_tokens: 3500
    })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || 'AI failed');
  return d.choices[0].message.content;
}

function parseJSON(t) { try { const m = t.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {} return { notes: t }; }

// POST /api/advance-care-planning/guide
// Body: { patient_id, state, preferences?, values? }
router.post('/guide', async (req, res) => {
  try {
    const { patient_id, state = 'US-Unknown', preferences = {}, values } = req.body || {};
    if (!patient_id || !state) {
      return res.status(400).json({ error: 'patient_id and state required' });
    }

    let patient = null;
    try { patient = await Patient.findByPk(patient_id); } catch (_) {}

    const systemPrompt = `You are an advance care planning co-pilot for hospice teams. Produce a state-specific
advance directive checklist (Living Will, Durable POA, POLST/MOLST, healthcare proxy, DNR/DNAR), suggest
discussion prompts that honor stated values, and flag jurisdiction-specific witness/notarization rules. Return
STRICT JSON only.`;

    const userPrompt = `Patient: ${patient ? JSON.stringify({ id: patient.id, name: patient.name, dob: patient.dob }) : patient_id}
State: ${state}
Stated preferences: ${JSON.stringify(preferences)}
Stated values: ${values || 'unspecified'}

Return JSON:
{
  "summary": "...",
  "documents_to_complete": [{ "name": "string", "purpose": "string", "state_specific_requirements": "string" }],
  "discussion_prompts": [{ "topic": "string", "question": "string", "follow_up_prompts": ["..."] }],
  "polst_or_molst_recommendation": { "applicable": true, "rationale": "string" },
  "witness_and_notary_rules": "string",
  "next_steps": ["..."],
  "disclaimer": "Educational template; clinician + attorney sign-off required."
}`;

    const raw = await callAI(systemPrompt, userPrompt);
    const parsed = parseJSON(raw);

    try {
      await AuditLog.create({
        action: 'acp_guide',
        entity_type: 'patient',
        entity_id: patient_id,
        details: { state },
        created_at: new Date()
      });
    } catch (_) {}

    res.json({ patient_id, state, guidance: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/templates/:state', async (req, res) => {
  res.json({
    state: req.params.state,
    standard_documents: ['Living Will', 'Durable POA for Healthcare', 'POLST/MOLST (if applicable)', 'Healthcare Proxy', 'DNR/DNAR'],
    note: 'AI-generated checklist; verify with state-specific forms.'
  });
});

module.exports = router;
