const express = require('express');
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const { Patient, CarePlan, Medication, SymptomLog, FamilyMember, Visit, Bereavement, TeamMeeting } = require('../models');
const router = express.Router();

async function callOpenRouter(prompt, systemMessage = '') {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI Hospice Care Manager'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
      messages: [
        { role: 'system', content: systemMessage || 'You are an expert hospice care clinical assistant. Provide compassionate, evidence-based recommendations. Format your response with clear sections using markdown headers (##), bullet points, and bold text for emphasis.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'OpenRouter API error');
  return data.choices[0].message.content;
}

// 1. Care Plan Narrative Generation
router.post('/care-plan-narrative', auth, async (req, res) => {
  try {
    const { patientId } = req.body;
    const patient = await Patient.findByPk(patientId);
    const carePlans = await CarePlan.findAll({ where: { patientId } });
    const medications = await Medication.findAll({ where: { patientId } });
    const symptoms = await SymptomLog.findAll({ where: { patientId }, limit: 5, order: [['date', 'DESC']] });

    const prompt = `Generate a comprehensive hospice care plan narrative for this patient:

Patient: ${patient.firstName} ${patient.lastName}, DOB: ${patient.dateOfBirth}
Diagnosis: ${patient.diagnosis}
Prognosis: ${patient.prognosis}
Level of Care: ${patient.levelOfCare}
Advance Directive: ${patient.advanceDirective ? 'Yes' : 'No'}, DNR: ${patient.dnrStatus ? 'Yes' : 'No'}

Current Care Plans: ${carePlans.map(cp => `${cp.type}: ${cp.goals}`).join('; ')}
Medications: ${medications.map(m => `${m.name} ${m.dosage} ${m.route} ${m.frequency}`).join('; ')}
Recent Symptoms: ${symptoms.map(s => `Pain:${s.painLevel}/10 Nausea:${s.nauseaLevel}/10 Anxiety:${s.anxietyLevel}/10 Dyspnea:${s.dyspneaLevel}/10`).join('; ')}

Please create a detailed narrative including patient background, current condition, care goals, interventions, and expected outcomes. Use compassionate, clinical language appropriate for hospice documentation.`;

    const result = await callOpenRouter(prompt);
    res.json({ result, type: 'care-plan-narrative' });
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

    const prompt = `Provide evidence-based symptom management recommendations for this hospice patient:

Patient: ${patient.firstName} ${patient.lastName}
Diagnosis: ${patient.diagnosis}
Current Medications: ${medications.map(m => `${m.name} ${m.dosage} ${m.route} for ${m.purpose}`).join('; ')}

Symptom Trends (most recent first):
${symptoms.map(s => `Date: ${s.date} - Pain:${s.painLevel}/10 Nausea:${s.nauseaLevel}/10 Anxiety:${s.anxietyLevel}/10 Dyspnea:${s.dyspneaLevel}/10 Fatigue:${s.fatigueLevel}/10 Notes: ${s.notes || 'N/A'}`).join('\n')}

Analyze symptom trends and provide:
1. Assessment of symptom control effectiveness
2. Medication adjustment suggestions
3. Non-pharmacological comfort measures
4. Signs to watch for that may indicate need for level of care change
5. Specific comfort positioning and environmental recommendations`;

    const result = await callOpenRouter(prompt);
    res.json({ result, type: 'symptom-recommendations' });
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

    const prompt = `Suggest personalized comfort measures for this hospice patient:

Patient: ${patient.firstName} ${patient.lastName}, Age: ${patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 'Unknown'}
Diagnosis: ${patient.diagnosis}
Level of Care: ${patient.levelOfCare}
Current Comfort Medications: ${medications.map(m => `${m.name} ${m.dosage} for ${m.purpose}`).join('; ')}
Recent Symptoms: ${symptoms.map(s => `Pain:${s.painLevel}/10 Nausea:${s.nauseaLevel}/10 Anxiety:${s.anxietyLevel}/10 Dyspnea:${s.dyspneaLevel}/10 Fatigue:${s.fatigueLevel}/10`).join('; ')}
Spiritual Preferences: ${patient.funeralPreferences || 'Not specified'}

Provide comprehensive comfort measure recommendations:
1. Environmental modifications (lighting, temperature, sounds)
2. Positioning techniques for specific symptoms
3. Non-pharmacological pain management
4. Anxiety and restlessness interventions
5. Nutrition and hydration comfort approaches
6. Skin care and pressure injury prevention
7. Complementary therapies (music, aromatherapy, touch)
8. End-of-life comfort protocols
9. Family involvement in comfort care`;

    const result = await callOpenRouter(prompt);
    res.json({ result, type: 'comfort-measures' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
