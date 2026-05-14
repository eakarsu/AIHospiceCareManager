/*
 * routes/coordination.js — Apply pass 5
 *
 * Mechanical (no-LLM) coordination helpers for hospice operations.
 * Reads existing Visit + Volunteer + Patient + Schedule models — does not
 * mutate clinical records. Handles common deterministic logistics tasks
 * called out in audit's "missing non-AI features" + "custom suggestions"
 * lists for AIHospiceCareManager (batch_04 §24):
 *
 *   - GET  /api/coordination/visit-conflicts        — overlapping visits
 *   - GET  /api/coordination/volunteer-match/:patientId — rule-based match
 *
 * No physician/clinician orders are issued. Output explicitly states
 * "informational; clinical decisions remain with care team".
 */

const express = require('express');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const { Visit, Volunteer, Patient } = require('../models');

const router = express.Router();

const DISCLAIMER = 'Informational only. Final scheduling and care decisions remain with the hospice care team.';

// ---------------------------------------------------------------------------
// Visit conflict detector — overlapping scheduled visits per clinician/day
// ---------------------------------------------------------------------------
router.get('/visit-conflicts', auth, async (req, res) => {
  try {
    const date = req.query.date; // YYYY-MM-DD optional
    const where = { status: 'scheduled' };
    if (date) {
      const start = new Date(date + 'T00:00:00Z');
      const end = new Date(date + 'T23:59:59Z');
      where.scheduledAt = { [Op.between]: [start, end] };
    }
    const visits = await Visit.findAll({ where });

    // Group by clinician/staff (whichever field exists). Defensive on schema.
    const groups = {};
    for (const v of visits) {
      const key = v.clinicianId || v.staffId || v.assignedTo || 'unassigned';
      if (!groups[key]) groups[key] = [];
      groups[key].push(v);
    }

    const conflicts = [];
    for (const [key, list] of Object.entries(groups)) {
      list.sort((a, b) => new Date(a.scheduledAt || a.date) - new Date(b.scheduledAt || b.date));
      for (let i = 1; i < list.length; i += 1) {
        const prev = list[i - 1];
        const cur = list[i];
        const prevEnd = new Date(prev.scheduledAt || prev.date);
        prevEnd.setMinutes(prevEnd.getMinutes() + (Number(prev.durationMinutes) || 60));
        const curStart = new Date(cur.scheduledAt || cur.date);
        if (curStart < prevEnd) {
          conflicts.push({
            clinician: key,
            visit_a_id: prev.id,
            visit_b_id: cur.id,
            overlap_minutes: Math.round((prevEnd - curStart) / 60000),
          });
        }
      }
    }

    res.json({
      total_visits: visits.length,
      total_conflicts: conflicts.length,
      conflicts,
      disclaimer: DISCLAIMER,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Volunteer match — rule-based scoring (skills, availability, distance)
// Distance is approximated by zip-code prefix match; no PII transmitted.
// ---------------------------------------------------------------------------
router.get('/volunteer-match/:patientId', auth, async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.patientId);
    if (!patient) return res.status(404).json({ error: 'patient_not_found' });

    const volunteers = await Volunteer.findAll({ where: { status: 'active' } });

    const patientNeeds = String(patient.specialNeeds || patient.preferences || '').toLowerCase();
    const patientZip = String(patient.zipCode || patient.zip || '').slice(0, 3);

    const ranked = volunteers.map((v) => {
      const skills = Array.isArray(v.skills) ? v.skills.join(' ').toLowerCase() : String(v.skills || '').toLowerCase();
      let score = 0;
      // Skill keyword overlap
      for (const kw of ['companionship', 'spiritual', 'pet', 'music', 'language', 'respite']) {
        if (patientNeeds.includes(kw) && skills.includes(kw)) score += 15;
      }
      // Zip-prefix proximity
      if (patientZip && String(v.zipCode || v.zip || '').startsWith(patientZip)) score += 25;
      // Availability presence
      if (v.availability) score += 10;
      // Background check
      if (v.backgroundCheckPassed === true) score += 15;
      // Hours-served sweet spot (10-200 hours)
      const hours = Number(v.hoursServed || 0);
      if (hours >= 10 && hours <= 200) score += 10;

      return {
        volunteer_id: v.id,
        name: `${v.firstName || ''} ${v.lastName || ''}`.trim(),
        score,
        background_check: v.backgroundCheckPassed === true,
        skills: v.skills,
        availability: v.availability,
      };
    }).sort((a, b) => b.score - a.score).slice(0, 10);

    res.json({
      patient_id: patient.id,
      candidates: ranked,
      disclaimer: DISCLAIMER + ' Volunteer assignments require care-team review and family consent.',
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
