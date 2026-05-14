require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const models = require('./models');
const createCrudRouter = require('./routes/crud');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const bereavementRoutes = require('./routes/bereavement');
// Apply pass 5 — additive
const integrationsRoutes = require('./routes/integrations');
const coordinationRoutes = require('./routes/coordination');

// === Batch 04 Gaps & Frontend Mounts ===
const route_gap_no_advance_directive_summarizer_for_care = require('./routes/gap-no-advance-directive-summarizer-for-care');
const route_gap_no_family_meeting_agenda_generator = require('./routes/gap-no-family-meeting-agenda-generator');
const route_gap_no_volunteer_need_matching_ai = require('./routes/gap-no-volunteer-need-matching-ai');
const route_gap_no_medication_tracking_module = require('./routes/gap-no-medication-tracking-module');
const route_gap_no_standardized_painsymptom_assessment_f = require('./routes/gap-no-standardized-painsymptom-assessment-f');
const route_gap_no_volunteer_coordination_module = require('./routes/gap-no-volunteer-coordination-module');
const route_gap_no_webhook_surface = require('./routes/gap-no-webhook-surface');
const route_gap_no_file_upload_for_advance_directives = require('./routes/gap-no-file-upload-for-advance-directives');
const route_gap_no_payment_billing_module = require('./routes/gap-no-payment-billing-module');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(require('helmet')());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Auth routes
app.use('/api/auth', authRoutes);

// AI routes (rate limiting applied inside routes/ai.js)
app.use('/api/ai', aiRoutes);

// Apply pass 5 additions — additive only
app.use('/api/integrations', integrationsRoutes);
app.use('/api/coordination', coordinationRoutes);

// CRUD routes for all models
app.use('/api/patients', createCrudRouter(models.Patient, 'Patient'));
app.use('/api/care-plans', createCrudRouter(models.CarePlan, 'CarePlan'));
app.use('/api/visits', createCrudRouter(models.Visit, 'Visit'));
app.use('/api/medications', createCrudRouter(models.Medication, 'Medication'));
app.use('/api/symptoms', createCrudRouter(models.SymptomLog, 'SymptomLog'));
app.use('/api/family-members', createCrudRouter(models.FamilyMember, 'FamilyMember'));
// Bereavement: due-contacts route MUST come before CRUD /:id
app.use('/api/bereavement', bereavementRoutes);
app.use('/api/bereavement', createCrudRouter(models.Bereavement, 'Bereavement'));
app.use('/api/volunteers', createCrudRouter(models.Volunteer, 'Volunteer'));
app.use('/api/schedules', createCrudRouter(models.Schedule, 'Schedule'));
app.use('/api/equipment', createCrudRouter(models.Equipment, 'Equipment'));
app.use('/api/certifications', createCrudRouter(models.Certification, 'Certification'));
app.use('/api/billing', createCrudRouter(models.Billing, 'Billing'));
app.use('/api/quality-measures', createCrudRouter(models.QualityMeasure, 'QualityMeasure'));
app.use('/api/spiritual-care', createCrudRouter(models.SpiritualCare, 'SpiritualCare'));
app.use('/api/social-work', createCrudRouter(models.SocialWorkAssessment, 'SocialWorkAssessment'));
app.use('/api/gip-beds', createCrudRouter(models.GIPBed, 'GIPBed'));
app.use('/api/supplies', createCrudRouter(models.Supply, 'Supply'));
app.use('/api/team-meetings', createCrudRouter(models.TeamMeeting, 'TeamMeeting'));
app.use('/api/compliance', createCrudRouter(models.ComplianceDoc, 'ComplianceDoc'));
app.use('/api/surveys', createCrudRouter(models.Survey, 'Survey'));
app.use('/api/legacy-messages', require('./routes/legacyMessages'));
app.use('/api/advance-care-planning', require('./routes/advanceCarePlanning'));

// Bereavement due contacts endpoint
// Dashboard stats
app.use('/api/dashboard', require('./middleware/auth'), async (req, res) => {
  try {
    const [
      totalPatients,
      activePatients,
      todayVisits,
      pendingBills,
      activeVolunteers,
      activeCertifications,
      recentSymptoms,
      bereavementActive
    ] = await Promise.all([
      models.Patient.count(),
      models.Patient.count({ where: { status: 'active' } }),
      models.Visit.count({ where: { status: 'scheduled' } }),
      models.Billing.count({ where: { claimStatus: 'pending' } }),
      models.Volunteer.count({ where: { status: 'active' } }),
      models.Certification.count({ where: { status: 'active' } }),
      models.SymptomLog.findAll({ limit: 5, order: [['date', 'DESC']] }),
      models.Bereavement.count({ where: { status: 'active' } })
    ]);
    res.json({
      totalPatients, activePatients, todayVisits, pendingBills,
      activeVolunteers, activeCertifications, recentSymptoms, bereavementActive
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    await sequelize.sync();
    
app.use('/api/gap-no-advance-directive-summarizer-for-care', route_gap_no_advance_directive_summarizer_for_care);
app.use('/api/gap-no-family-meeting-agenda-generator', route_gap_no_family_meeting_agenda_generator);
app.use('/api/gap-no-volunteer-need-matching-ai', route_gap_no_volunteer_need_matching_ai);
app.use('/api/gap-no-medication-tracking-module', route_gap_no_medication_tracking_module);
app.use('/api/gap-no-standardized-painsymptom-assessment-f', route_gap_no_standardized_painsymptom_assessment_f);
app.use('/api/gap-no-volunteer-coordination-module', route_gap_no_volunteer_coordination_module);
app.use('/api/gap-no-webhook-surface', route_gap_no_webhook_surface);
app.use('/api/gap-no-file-upload-for-advance-directives', route_gap_no_file_upload_for_advance_directives);
app.use('/api/gap-no-payment-billing-module', route_gap_no_payment_billing_module);

app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
  }
}

start();
