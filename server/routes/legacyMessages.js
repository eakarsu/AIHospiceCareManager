// Legacy letter platform with patient-recorded messages delivered at milestones.
// Audit: batch_04.md / AIHospiceCareManager / Custom Feature Suggestions #2
const express = require('express');
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const { Patient, FamilyMember, AuditLog } = require('../models');

const router = express.Router();
router.use(auth);

async function callAI(systemPrompt, userPrompt) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'X-Title': 'Hospice - Legacy Messages'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || (process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.6, max_tokens: 2000
    })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || 'AI failed');
  return d.choices[0].message.content;
}

function parseJSON(t) { try { const m = t.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {} return { notes: t }; }

// POST /api/legacy-messages/draft
router.post('/draft', async (req, res) => {
  try {
    const { patient_id, recipient_name, recipient_relationship, milestone, themes = [], tone = 'warm' } = req.body || {};
    if (!patient_id || !recipient_name || !milestone) {
      return res.status(400).json({ error: 'patient_id, recipient_name, milestone required' });
    }

    let patient = null;
    try { patient = await Patient.findByPk(patient_id); } catch (_) {}

    const systemPrompt = `You are a hospice chaplain's assistant helping a patient draft a posthumous message
to a loved one for a future milestone. Voice is the patient's. Tone: warm, reassuring, never preachy. Return
STRICT JSON only.`;

    const userPrompt = `Patient: ${patient ? patient.name : patient_id}
Recipient: ${recipient_name} (${recipient_relationship || 'loved one'})
Milestone: ${milestone}
Themes to weave: ${JSON.stringify(themes)}
Tone: ${tone}

Return JSON:
{
  "subject_line": "string",
  "message_body": "string (3-5 paragraphs, first-person)",
  "recommended_delivery": { "channel": "video|audio|letter|email", "timing_note": "string" },
  "interviewer_followup_prompts": ["..."],
  "alternate_versions": [{ "tone": "string", "body": "string" }],
  "disclaimer": "Patient-voiced draft; patient must approve before finalizing."
}`;

    const raw = await callAI(systemPrompt, userPrompt);
    const parsed = parseJSON(raw);

    try {
      await AuditLog.create({
        action: 'legacy_message_drafted',
        entity_type: 'patient',
        entity_id: patient_id,
        details: { recipient_name, milestone },
        created_at: new Date()
      });
    } catch (_) {}

    res.json({ patient_id, recipient_name, milestone, draft: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/legacy-messages/family/:patient_id
router.get('/family/:patient_id', async (req, res) => {
  try {
    let fm = [];
    try { fm = await FamilyMember.findAll({ where: { patient_id: req.params.patient_id }, limit: 50 }); } catch (_) {}
    res.json(fm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
