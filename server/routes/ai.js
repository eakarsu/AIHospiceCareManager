const express = require('express');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const auth = require('../middleware/auth');
const { Patient, CarePlan, Medication, SymptomLog, FamilyMember, Visit, Bereavement, TeamMeeting, AuditLog } = require('../models');
const router = express.Router();

// AI rate limiter: 20 requests/hour per user
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user ? `user:${req.user.id}` : ipKeyGenerator(req.ip),
  message: { error: 'AI rate limit exceeded. Max 20 requests/hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(aiRateLimiter);

const PHI_DISCLAIMER = 'IMPORTANT: This analysis is for internal clinical use only. Do not store or share this output outside the care team.';

async function callOpenRouter(prompt, systemMessage = '') {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI Hospice Care Manager',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || (process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5'),
      messages: [
        { role: 'system', content: (systemMessage || 'You are an expert hospice care clinical assistant. Provide compassionate, evidence-based recommendations.') + '\n\n' + PHI_DISCLAIMER },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'OpenRouter API error');
  return data.choices[0].message.content;
}

function logPHIAccess(req, patientId) {
  AuditLog.create({
    user_id: req.user?.id,
    action: 'AI_PHI_ACCESS',
    entity_type: 'patient',
    entity_id: patientId,
    details: `AI endpoint: ${req.path}`,
  }).catch(() => {});
}

function parseStructured(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (_) {}
  return null;
}

// 1. Care Plan Narrative Generation
router.post('/care-plan-narrative', auth, async (req, res) => {
  try {
    const { patientId } = req.body;
    const patient = await Patient.findByPk(patientId);
    const carePlans = await CarePlan.findAll({ where: { patientId } });
    const medications = await Medication.findAll({ where: { patientId } });
    const symptoms = await SymptomLog.findAll({ where: { patientId }, limit: 5, order: [['date', 'DESC']] });

    logPHIAccess(req, patientId);

    const prompt = `Generate a comprehensive hospice care plan narrative for this patient:

Patient: ${patient.firstName} ${patient.lastName}, DOB: ${patient.dateOfBirth}
Diagnosis: ${patient.diagnosis}
Prognosis: ${patient.prognosis}
Level of Care: ${patient.levelOfCare}
Advance Directive: ${patient.advanceDirective ? 'Yes' : 'No'}, DNR: ${patient.dnrStatus ? 'Yes' : 'No'}

Current Care Plans: ${carePlans.map(cp => `${cp.type}: ${cp.goals}`).join('; ')}
Medications: ${medications.map(m => `${m.name} ${m.dosage} ${m.route} ${m.frequency}`).join('; ')}
Recent Symptoms: ${symptoms.map(s => `Pain:${s.painLevel}/10 Nausea:${s.nauseaLevel}/10 Anxiety:${s.anxietyLevel}/10 Dyspnea:${s.dyspneaLevel}/10`).join('; ')}

Return JSON: { "narrative": string, "key_priorities": string[], "family_message": string, "clinical_notes": string }`;

    const raw = await callOpenRouter(prompt, 'You are an expert hospice care clinical assistant. Provide compassionate, evidence-based recommendations. Format your response as JSON.');
    const structured = parseStructured(raw);
    res.json({ result: structured ? structured.narrative : raw, structured, raw, type: 'care-plan-narrative' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Family Communication Drafting
router.post('/family-communication', auth, async (req, res) => {
  try {
    const { patientId, communicationType, specificConcerns } = req.body;
    const patient = await Patient.findByPk(patientId);
    const family = await FamilyMember.findAll({ where: { patientId } });
    const recentSymptoms = await SymptomLog.findAll({ where: { patientId }, limit: 3, order: [['date', 'DESC']] });

    logPHIAccess(req, patientId);

    const prompt = `Draft a compassionate ${communicationType || 'update'} communication for the family of a hospice patient:

Patient: ${patient.firstName} ${patient.lastName}
Diagnosis: ${patient.diagnosis}
Current Level of Care: ${patient.levelOfCare}
Family Members: ${family.map(f => `${f.name} (${f.relationship}${f.isPrimaryCaregiver ? ', Primary Caregiver' : ''})`).join('; ')}
Recent Symptoms: ${recentSymptoms.map(s => `Pain:${s.painLevel}/10 Nausea:${s.nauseaLevel}/10 Anxiety:${s.anxietyLevel}/10`).join('; ')}
${specificConcerns ? `Specific Concerns: ${specificConcerns}` : ''}

Create a warm, empathetic letter that provides updates while being sensitive to the family's emotional state. Include guidance on what to expect and how they can help with comfort care.`;

    const result = await callOpenRouter(prompt);
    res.json({ result, type: 'family-communication' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Symptom Management Recommendations
router.post('/symptom-recommendations', auth, async (req, res) => {
  try {
    const { patientId } = req.body;
    const patient = await Patient.findByPk(patientId);
    const symptoms = await SymptomLog.findAll({ where: { patientId }, limit: 10, order: [['date', 'DESC']] });
    const medications = await Medication.findAll({ where: { patientId, status: 'active' } });

    logPHIAccess(req, patientId);

    const prompt = `Provide evidence-based symptom management recommendations for this hospice patient:

Patient: ${patient.firstName} ${patient.lastName}
Diagnosis: ${patient.diagnosis}
Current Medications: ${medications.map(m => `${m.name} ${m.dosage} ${m.route} for ${m.purpose}`).join('; ')}

Symptom Trends (most recent first):
${symptoms.map(s => `Date: ${s.date} - Pain:${s.painLevel}/10 Nausea:${s.nauseaLevel}/10 Anxiety:${s.anxietyLevel}/10 Dyspnea:${s.dyspneaLevel}/10 Fatigue:${s.fatigueLevel}/10 Notes: ${s.notes || 'N/A'}`).join('\n')}

Return JSON: { "immediate_actions": string[], "medication_adjustments": string[], "comfort_measures": string[], "escalation_triggers": string[] }`;

    const raw = await callOpenRouter(prompt, 'You are an expert hospice symptom management clinician. Return valid JSON.');
    const structured = parseStructured(raw);
    res.json({ result: structured ? JSON.stringify(structured, null, 2) : raw, structured, raw, type: 'symptom-recommendations' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Bereavement Resource Personalization
router.post('/bereavement-resources', auth, async (req, res) => {
  try {
    const { patientId, familyMemberId } = req.body;
    const patient = await Patient.findByPk(patientId);
    const family = familyMemberId
      ? await FamilyMember.findByPk(familyMemberId)
      : await FamilyMember.findOne({ where: { patientId, isPrimaryCaregiver: true } });
    const bereavement = await Bereavement.findAll({ where: { patientId } });

    logPHIAccess(req, patientId);

    const prompt = `Create personalized bereavement support resources for a hospice family member:

Deceased Patient: ${patient.firstName} ${patient.lastName}
Diagnosis: ${patient.diagnosis}
Family Member: ${family ? `${family.name} (${family.relationship}), Bereavement Risk: ${family.bereavementRisk}` : 'Primary caregiver'}
Bereavement Program Status: ${bereavement.length > 0 ? `${bereavement[0].monthsCompleted} months completed of 13-month program` : 'Not yet enrolled'}

Provide:
1. Personalized grief support recommendations based on relationship and risk level
2. Age-appropriate resources if applicable
3. Support group recommendations
4. Self-care strategies for the grieving period
5. Warning signs that professional counseling may be needed
6. Memorial and legacy project suggestions
7. Monthly milestone guidance for the 13-month bereavement period`;

    const result = await callOpenRouter(prompt);
    res.json({ result, type: 'bereavement-resources' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. IDT Meeting Summary
router.post('/meeting-summary', auth, async (req, res) => {
  try {
    const { meetingId } = req.body;
    const meeting = await TeamMeeting.findByPk(meetingId);
    let patientInfo = '';
    if (meeting.patientId) {
      const patient = await Patient.findByPk(meeting.patientId);
      patientInfo = `Patient: ${patient.firstName} ${patient.lastName}, Diagnosis: ${patient.diagnosis}, Level of Care: ${patient.levelOfCare}`;
      logPHIAccess(req, meeting.patientId);
    }

    const prompt = `Generate a professional interdisciplinary team (IDT) meeting summary:

Meeting Date: ${meeting.meetingDate}
${patientInfo}
Attendees: ${meeting.attendees}
Agenda: ${meeting.agenda}
Discussion Notes: ${meeting.discussion}
Decisions Made: ${meeting.decisions}

Create a structured, professional meeting summary including:
1. Meeting overview and attendance
2. Key discussion points
3. Clinical updates and assessments
4. Care plan modifications discussed
5. Decisions and rationale
6. Action items with responsible parties
7. Follow-up timeline`;

    const result = await callOpenRouter(prompt);
    await meeting.update({ aiSummary: result });
    res.json({ result, type: 'meeting-summary' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Compliance Documentation Assistance
router.post('/compliance-documentation', auth, async (req, res) => {
  try {
    const { patientId, documentType } = req.body;
    const patient = await Patient.findByPk(patientId);
    const certifications = await require('../models').Certification.findAll({ where: { patientId } });
    const visits = await Visit.findAll({ where: { patientId }, limit: 10, order: [['visitDate', 'DESC']] });

    logPHIAccess(req, patientId);

    const prompt = `Generate ${documentType || 'regulatory compliance'} documentation for a hospice patient:

Patient: ${patient.firstName} ${patient.lastName}
Diagnosis: ${patient.diagnosis}
Prognosis: ${patient.prognosis}
Admission Date: ${patient.admissionDate}
Insurance: ${patient.insuranceType}
Level of Care: ${patient.levelOfCare}
Certifications: ${certifications.map(c => `Period ${c.benefitPeriod}: ${c.startDate} to ${c.endDate}, Certifying MD: ${c.certifyingPhysician}`).join('; ')}
Recent Visits: ${visits.map(v => `${v.visitDate} - ${v.visitType} by ${v.clinicianName} (${v.clinicianRole})`).join('; ')}

Generate compliant documentation that meets Medicare/CMS hospice requirements including:
1. Clinical eligibility justification
2. Terminal prognosis documentation
3. Plan of care compliance elements
4. Face-to-face encounter narrative (if applicable)
5. Level of care justification
6. Regulatory checklist items`;

    const result = await callOpenRouter(prompt);
    res.json({ result, type: 'compliance-documentation' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Comfort Measure Suggestions
router.post('/comfort-measures', auth, async (req, res) => {
  try {
    const { patientId } = req.body;
    const patient = await Patient.findByPk(patientId);
    const symptoms = await SymptomLog.findAll({ where: { patientId }, limit: 5, order: [['date', 'DESC']] });
    const medications = await Medication.findAll({ where: { patientId, isComfortMed: true } });

    logPHIAccess(req, patientId);

    const prompt = `Suggest personalized comfort measures for this hospice patient:

Patient: ${patient.firstName} ${patient.lastName}, Age: ${patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 'Unknown'}
Diagnosis: ${patient.diagnosis}
Level of Care: ${patient.levelOfCare}
Current Comfort Medications: ${medications.map(m => `${m.name} ${m.dosage} for ${m.purpose}`).join('; ')}
Recent Symptoms: ${symptoms.map(s => `Pain:${s.painLevel}/10 Nausea:${s.nauseaLevel}/10 Anxiety:${s.anxietyLevel}/10 Dyspnea:${s.dyspneaLevel}/10 Fatigue:${s.fatigueLevel}/10`).join('; ')}

Return JSON: { "pharmacological": string[], "non_pharmacological": string[], "environment_modifications": string[], "caregiver_guidance": string[] }`;

    const raw = await callOpenRouter(prompt, 'You are an expert hospice palliative care specialist. Return valid JSON.');
    const structured = parseStructured(raw);
    res.json({ result: structured ? JSON.stringify(structured, null, 2) : raw, structured, raw, type: 'comfort-measures' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Predictive Decline / Hospice-Eligibility Recheck
router.post('/predictive-decline', auth, async (req, res) => {
  try {
    const { patientId } = req.body;
    if (!patientId) return res.status(400).json({ error: 'patientId is required' });

    const patient = await Patient.findByPk(patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const symptoms = await SymptomLog.findAll({ where: { patientId }, limit: 20, order: [['date', 'DESC']] });
    const visits = await Visit.findAll({ where: { patientId }, limit: 10, order: [['visitDate', 'DESC']] });
    const certifications = await require('../models').Certification.findAll({ where: { patientId }, order: [['startDate', 'DESC']], limit: 3 });

    logPHIAccess(req, patientId);

    const daysSinceAdmission = patient.admissionDate
      ? Math.floor((new Date() - new Date(patient.admissionDate)) / (1000 * 60 * 60 * 24))
      : 'unknown';

    const symptomTrend = symptoms.map(s =>
      `${s.date}: Pain=${s.painLevel}/10 Nausea=${s.nauseaLevel}/10 Dyspnea=${s.dyspneaLevel}/10 Fatigue=${s.fatigueLevel}/10`
    ).join('\n');

    const prompt = `Perform a hospice eligibility recheck and decline trajectory analysis for this patient:

Patient: ${patient.firstName} ${patient.lastName}
Diagnosis: ${patient.diagnosis}
Prognosis: ${patient.prognosis}
Days Since Admission: ${daysSinceAdmission}
Level of Care: ${patient.levelOfCare}
Insurance: ${patient.insuranceType}

Certification History: ${certifications.map(c => `Benefit Period ${c.benefitPeriod}: ${c.startDate} - ${c.endDate}`).join('; ')}

Recent Visit Notes: ${visits.map(v => `${v.visitDate} - ${v.visitType}: ${v.notes || 'No notes'}`).join('; ')}

Symptom Trend (last 20 logs):
${symptomTrend || 'No symptom logs available'}

Return JSON: {
  "still_eligible": boolean,
  "eligibility_confidence": number (0-100),
  "decline_trajectory": "rapid"|"steady"|"stable"|"improving",
  "gip_need_indicated": boolean,
  "f2f_encounter_recommended": boolean,
  "key_clinical_indicators": string[],
  "risk_flags": string[],
  "recommended_level_of_care": string,
  "f2f_prep_notes": string,
  "estimated_months_remaining": string
}`;

    const raw = await callOpenRouter(prompt, 'You are an expert hospice eligibility clinician. Return only valid JSON.');
    const structured = parseStructured(raw);

    res.json({ result: structured ? JSON.stringify(structured, null, 2) : raw, structured, raw, type: 'predictive-decline', patientId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Bereavement Contact Recommendation
router.post('/bereavement-contact', auth, async (req, res) => {
  try {
    const { bereavementId } = req.body;
    if (!bereavementId) return res.status(400).json({ error: 'bereavementId is required' });

    const bereavement = await Bereavement.findByPk(bereavementId);
    if (!bereavement) return res.status(404).json({ error: 'Bereavement record not found' });

    const patient = await Patient.findByPk(bereavement.patientId).catch(() => null);
    const family = await FamilyMember.findOne({ where: { patientId: bereavement.patientId, isPrimaryCaregiver: true } }).catch(() => null);

    logPHIAccess(req, bereavement.patientId);

    const monthsCompleted = bereavement.monthsCompleted || 0;
    const nextMilestone = monthsCompleted < 1 ? 1 : monthsCompleted < 3 ? 3 : monthsCompleted < 6 ? 6 : monthsCompleted < 12 ? 12 : 13;

    const prompt = `Generate a personalized bereavement contact script and next-step plan for month ${nextMilestone} of the 13-month bereavement program.

Bereaved Family Member: ${family ? `${family.name} (${family.relationship})` : 'Primary caregiver'}
Bereavement Risk Level: ${family?.bereavementRisk || bereavement.riskLevel || 'unknown'}
Months Completed: ${monthsCompleted}
Last Contact Date: ${bereavement.lastContactDate || 'Not recorded'}
Loss: ${patient ? `${patient.firstName} ${patient.lastName} (${patient.diagnosis})` : 'Hospice patient'}
Notes: ${bereavement.notes || 'None'}

Return JSON: {
  "contact_method": "phone"|"letter"|"email"|"in-person",
  "contact_script": string,
  "key_themes_for_month": string[],
  "grief_stage_indicators": string[],
  "escalation_needed": boolean,
  "escalation_reason": string,
  "resources_to_offer": string[],
  "next_contact_month": number
}`;

    const raw = await callOpenRouter(prompt, 'You are an expert hospice bereavement counselor. Return only valid JSON.');
    const structured = parseStructured(raw);

    // Auto-increment monthsCompleted
    const updatedMonths = Math.max(monthsCompleted, nextMilestone);
    await bereavement.update({
      monthsCompleted: updatedMonths,
      lastContactDate: new Date(),
    }).catch(() => {});

    res.json({ result: structured ? JSON.stringify(structured, null, 2) : raw, structured, raw, type: 'bereavement-contact', bereavementId, monthsNowCompleted: updatedMonths });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Advance Directive Summarizer
router.post('/advance-directive-summarizer', auth, async (req, res) => {
  try {
    const { patientId, directiveText } = req.body;
    if (!patientId) return res.status(400).json({ error: 'patientId required' });
    const patient = await Patient.findByPk(patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    logPHIAccess(req, patientId);

    const prompt = `Summarize the advance directive for the care team. Highlight resuscitation, intubation, artificial nutrition/hydration, antibiotics, and hospital transfer preferences. Flag any ambiguity for clarification.

Patient: ${patient.firstName} ${patient.lastName}, DOB: ${patient.dateOfBirth || 'unknown'}
Diagnosis: ${patient.diagnosis || 'unspecified'}
DNR on record: ${patient.dnrStatus ? 'Yes' : 'No'}
Advance directive on file: ${patient.advanceDirective ? 'Yes' : 'No'}

Directive text (verbatim or paraphrased by user):
${directiveText || 'No directive text provided. Use patient profile to summarize what is documented and flag missing items.'}

Return JSON: { "headline": string, "preferences": { "resuscitation": string, "intubation": string, "artificial_nutrition_hydration": string, "antibiotics": string, "hospital_transfer": string, "comfort_care_only": string }, "ambiguities": string[], "recommended_clarifications": string[], "team_briefing": string }`;

    const raw = await callOpenRouter(prompt, 'You are a hospice clinical documentation specialist. Produce concise, faithful, non-paraphrasing summaries of advance directives. Format your response as JSON.');
    const structured = parseStructured(raw);
    res.json({ result: structured ? structured.team_briefing : raw, structured, raw, type: 'advance-directive-summarizer', patientId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Family Meeting Agenda Generator
router.post('/family-meeting-agenda-generator', auth, async (req, res) => {
  try {
    const { patientId, meetingPurpose, attendees, durationMinutes } = req.body;
    if (!patientId) return res.status(400).json({ error: 'patientId required' });
    const patient = await Patient.findByPk(patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const carePlans = await CarePlan.findAll({ where: { patientId } });
    const symptoms = await SymptomLog.findAll({ where: { patientId }, limit: 5, order: [['date', 'DESC']] });
    const familyMembers = await FamilyMember.findAll({ where: { patientId } }).catch(() => []);

    logPHIAccess(req, patientId);

    const prompt = `Generate a family meeting agenda tailored to this hospice patient and the meeting's purpose. Be compassionate, clinically grounded, and culturally sensitive.

Patient: ${patient.firstName} ${patient.lastName}, Diagnosis: ${patient.diagnosis || 'unspecified'}, Prognosis: ${patient.prognosis || 'unspecified'}
Level of Care: ${patient.levelOfCare || 'unspecified'}
Care Plans: ${carePlans.map(cp => `${cp.type}: ${cp.goals}`).join('; ') || 'none'}
Recent symptoms: ${symptoms.map(s => `Pain:${s.painLevel}/10 Nausea:${s.nauseaLevel}/10 Anxiety:${s.anxietyLevel}/10 Dyspnea:${s.dyspneaLevel}/10`).join('; ') || 'no recent log'}
Family members on file: ${familyMembers.map(f => `${f.name} (${f.relationship})`).join(', ') || 'none recorded'}

Meeting purpose: ${meetingPurpose || 'general care review'}
Stated attendees: ${attendees || 'patient, primary caregiver, hospice nurse, social worker'}
Duration target: ${durationMinutes ? durationMinutes + ' minutes' : '60 minutes'}

Return JSON: { "title": string, "objectives": string[], "agenda": [{ "topic": string, "minutes": number, "lead": string, "talking_points": string[] }], "questions_to_invite_from_family": string[], "potential_decisions": string[], "follow_up_actions": string[], "tone_guidance": string }`;

    const raw = await callOpenRouter(prompt, 'You are a hospice care meeting facilitator. Build agendas that balance clinical clarity with family support. Format your response as JSON.');
    const structured = parseStructured(raw);
    res.json({ result: structured ? structured.title : raw, structured, raw, type: 'family-meeting-agenda', patientId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const CLINICAL_DISCLAIMER = 'Clinical decision support only — verify with care team before acting';

// 12. Pain Management AI Advisor (LLM advisory only)
router.post('/pain-management-advisor', auth, async (req, res) => {
  try {
    const { patient_id, pain_assessment, contraindications, allergies } = req.body || {};
    if (!pain_assessment || typeof pain_assessment !== 'object') {
      return res.status(400).json({ error: 'pain_assessment object required' });
    }
    const { scale, location, quality, duration_days, current_medications } = pain_assessment;

    if (patient_id) logPHIAccess(req, patient_id);

    const prompt = `Provide clinical decision support for hospice pain management. This is advisory only — NOT a prescription. Always flag medication-safety review when opioids, adjuvants, or drug-drug interactions are involved.

Pain assessment:
- Numeric scale (0-10): ${scale ?? 'not reported'}
- Location: ${location || 'unspecified'}
- Quality (e.g., burning, aching, neuropathic): ${quality || 'unspecified'}
- Duration (days): ${duration_days ?? 'unspecified'}
- Current medications: ${Array.isArray(current_medications) ? current_medications.join(', ') : (current_medications || 'none reported')}
Contraindications: ${Array.isArray(contraindications) ? contraindications.join(', ') : (contraindications || 'none reported')}
Allergies: ${Array.isArray(allergies) ? allergies.join(', ') : (allergies || 'none reported')}

Return JSON: { "recommended_approaches": [{ "intervention": string, "rationale": string, "monitoring": string }], "requires_md_review": boolean, "escalation_indicators": string[], "family_education_points": string[] }

Set requires_md_review=true when: opioid initiation/escalation, suspected interactions, renal/hepatic concerns, neuropathic adjuvants, breakthrough-dosing changes, or any contraindication conflict. Label all output as clinical decision support, not a prescription.`;

    const raw = await callOpenRouter(prompt, 'You are a hospice clinical decision support assistant. You do NOT prescribe. Output is advisory only and must be verified by a licensed clinician. Format your response as JSON.');
    const structured = parseStructured(raw);
    res.json({
      disclaimer: CLINICAL_DISCLAIMER,
      advisory_label: 'clinical decision support, not a prescription',
      recommended_approaches: structured?.recommended_approaches || [],
      requires_md_review: structured?.requires_md_review !== undefined ? !!structured.requires_md_review : true,
      escalation_indicators: structured?.escalation_indicators || [],
      family_education_points: structured?.family_education_points || [],
      structured,
      raw,
      type: 'pain-management-advisor',
      patient_id: patient_id || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message, disclaimer: CLINICAL_DISCLAIMER });
  }
});

// 13. Grief Stage Detection + Adaptive Support
router.post('/grief-stage-detection', auth, async (req, res) => {
  try {
    const { caregiver_notes, observable_behaviors, days_since_loss, prior_assessments } = req.body || {};
    if (!caregiver_notes || typeof caregiver_notes !== 'string') {
      return res.status(400).json({ error: 'caregiver_notes (string) required' });
    }

    const prompt = `Assess grief stage from caregiver-reported notes and recommend adaptive supportive interventions. This is screening-level decision support, not a diagnosis. Watch for complicated/prolonged grief indicators.

Caregiver notes: ${caregiver_notes}
Observable behaviors: ${Array.isArray(observable_behaviors) ? observable_behaviors.join('; ') : (observable_behaviors || 'not provided')}
Days since loss: ${days_since_loss ?? 'unspecified'}
Prior assessments: ${Array.isArray(prior_assessments) ? prior_assessments.join('; ') : (prior_assessments || 'none on file')}

Use a recognized framework (e.g., Kübler-Ross stages, Worden's tasks, or dual-process model). Pick the closest assessed stage but acknowledge non-linearity.

Return JSON: { "assessed_stage": string, "framework_used": string, "indicators_present": string[], "supportive_interventions": [{ "intervention": string, "rationale": string }], "watch_for_complicated_grief": string[], "suggested_followup_window_days": number }`;

    const raw = await callOpenRouter(prompt, 'You are a hospice bereavement specialist providing screening-level decision support. Do not diagnose. Format your response as JSON.');
    const structured = parseStructured(raw);
    res.json({
      disclaimer: CLINICAL_DISCLAIMER,
      assessed_stage: structured?.assessed_stage || null,
      framework_used: structured?.framework_used || null,
      indicators_present: structured?.indicators_present || [],
      supportive_interventions: structured?.supportive_interventions || [],
      watch_for_complicated_grief: structured?.watch_for_complicated_grief || [],
      suggested_followup_window_days: structured?.suggested_followup_window_days ?? null,
      structured,
      raw,
      type: 'grief-stage-detection',
    });
  } catch (err) {
    res.status(500).json({ error: err.message, disclaimer: CLINICAL_DISCLAIMER });
  }
});

// 14. Advance Care Planning Summary (stateless)
router.post('/advance-care-planning-summary', auth, async (req, res) => {
  try {
    const { patient, conversation_notes } = req.body || {};
    if (!patient || typeof patient !== 'object') {
      return res.status(400).json({ error: 'patient object required' });
    }
    const { diagnosis, prognosis_summary, values_statements, treatment_preferences } = patient;

    const prompt = `Produce an advance care planning (ACP) summary package for the care team and family. Stateless — do not assume any prior data beyond what is provided. Identify gaps that still need clinician follow-up.

Patient summary:
- Diagnosis: ${diagnosis || 'unspecified'}
- Prognosis summary: ${prognosis_summary || 'unspecified'}
- Values statements: ${Array.isArray(values_statements) ? values_statements.join('; ') : (values_statements || 'none captured')}
- Treatment preferences: ${Array.isArray(treatment_preferences) ? treatment_preferences.join('; ') : (treatment_preferences || 'none captured')}

Conversation notes: ${conversation_notes || 'none provided'}

Return JSON: { "summary_for_chart": string, "family_conversation_starter": string, "document_drafts": { "living_will_outline": string, "dnr_rationale": string, "healthcare_proxy_guidance": string }, "gaps_to_address": string[] }

All drafts are STARTING POINTS for clinician + family review, not finalized legal documents.`;

    const raw = await callOpenRouter(prompt, 'You are a hospice advance care planning facilitator. Produce respectful, values-aligned drafts that require human review before use. Format your response as JSON.');
    const structured = parseStructured(raw);
    res.json({
      disclaimer: CLINICAL_DISCLAIMER,
      summary_for_chart: structured?.summary_for_chart || '',
      family_conversation_starter: structured?.family_conversation_starter || '',
      document_drafts: structured?.document_drafts || { living_will_outline: '', dnr_rationale: '', healthcare_proxy_guidance: '' },
      gaps_to_address: structured?.gaps_to_address || [],
      structured,
      raw,
      type: 'advance-care-planning-summary',
    });
  } catch (err) {
    res.status(500).json({ error: err.message, disclaimer: CLINICAL_DISCLAIMER });
  }
});

module.exports = router;
