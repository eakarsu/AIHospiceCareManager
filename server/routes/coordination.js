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
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
        return res.status(400).json({ error: 'date must be an actual YYYY-MM-DD calendar date.' });
      }
      const start = new Date(date + 'T00:00:00Z');
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      where.visitDate = { [Op.gte]: start, [Op.lt]: end };
    }
    const visits = await Visit.findAll({ where });

    // Only documented native clinician/date/duration values establish overlap.
    const groups = {};
    let insufficientSourceVisits = 0;
    for (const v of visits) {
      const key = String(v.clinicianName || '').trim();
      if (!key || !v.visitDate || !Number.isFinite(new Date(v.visitDate).getTime()) || !(Number(v.duration) > 0)) {
        insufficientSourceVisits++;
        continue;
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(v);
    }

    const conflicts = [];
    for (const [key, list] of Object.entries(groups)) {
      list.sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate));
      for (let i = 1; i < list.length; i += 1) {
        const cur = list[i];
        const curStart = new Date(cur.visitDate).getTime();
        const curEnd = curStart + Number(cur.duration) * 60000;
        for (const prev of list.slice(0, i)) {
          const prevEnd = new Date(prev.visitDate).getTime() + Number(prev.duration) * 60000;
          const overlap = Math.min(prevEnd, curEnd) - curStart;
          if (overlap > 0) conflicts.push({
              clinician: key,
              visit_a_id: prev.id,
              visit_b_id: cur.id,
              overlap_minutes: Math.round(overlap / 60000),
            });
        }
      }
    }

    res.json({
      total_visits: visits.length,
      total_conflicts: conflicts.length,
      conflicts,
      insufficient_source_visits: insufficientSourceVisits,
      date_timezone: 'UTC',
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
