const express = require('express');
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const models = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// Bereavement due contacts — must be before CRUD /:id routes
router.get('/due-contacts', auth, async (req, res) => {
  try {
    // Months where contact is due: 0 (due at 1mo), 2 (due at 3mo), 5 (due at 6mo), 11 (due at 12mo)
    const dueMonths = [0, 2, 5, 11];
    const records = await models.Bereavement.findAll({
      where: {
        monthsCompleted: { [Op.in]: dueMonths },
        status: 'active',
      },
    });

    const results = await Promise.all(records.map(async (b) => {
      const dueAtMonth = b.monthsCompleted + 1;
      let patient = null;
      try { patient = b.patientId ? await models.Patient.findByPk(b.patientId) : null; } catch (_) {}

      const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'the patient';
      const diagnosis = patient?.diagnosis || 'illness';
      const relationship = b.contactName || 'family member';

      const prompt = `Generate a compassionate month ${dueAtMonth} bereavement follow-up message for a family member named ${relationship} who lost ${patientName} to ${diagnosis}. Return JSON only: { "subject": string, "message": string, "tone": string }`;

      let suggested_message = null;
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'AI Hospice Care Manager',
          },
          body: JSON.stringify({
            model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
            messages: [
              {
                role: 'system',
                content: 'IMPORTANT: This analysis is for internal clinical use only. Do not store or share this output outside the care team. You are a compassionate hospice bereavement coordinator. Return only valid JSON.',
              },
              { role: 'user', content: prompt },
            ],
            max_tokens: 600,
            temperature: 0.6,
          }),
        });
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) suggested_message = JSON.parse(jsonMatch[0]);
      } catch (_) {}

      return {
        bereavement_id: b.id,
        family_name: b.contactName,
        months: b.monthsCompleted,
        due_at_month: dueAtMonth,
        patient_name: patientName,
        suggested_message,
      };
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
