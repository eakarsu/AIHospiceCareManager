require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const models = require('./models');
const createCrudRouter = require('./routes/crud');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth routes
app.use('/api/auth', authRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

// CRUD routes for all models
app.use('/api/patients', createCrudRouter(models.Patient, 'Patient'));
app.use('/api/care-plans', createCrudRouter(models.CarePlan, 'CarePlan'));
app.use('/api/visits', createCrudRouter(models.Visit, 'Visit'));
app.use('/api/medications', createCrudRouter(models.Medication, 'Medication'));
app.use('/api/symptoms', createCrudRouter(models.SymptomLog, 'SymptomLog'));
app.use('/api/family-members', createCrudRouter(models.FamilyMember, 'FamilyMember'));
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
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
  }
}

start();
