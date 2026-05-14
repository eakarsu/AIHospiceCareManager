const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// User Model
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'nurse' }
});

// Patient Model
const Patient = sequelize.define('Patient', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  dateOfBirth: { type: DataTypes.DATEONLY },
  gender: { type: DataTypes.STRING },
  admissionDate: { type: DataTypes.DATEONLY },
  diagnosis: { type: DataTypes.TEXT },
  prognosis: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  levelOfCare: { type: DataTypes.STRING, defaultValue: 'routine' },
  primaryPhysician: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  phone: { type: DataTypes.STRING },
  insuranceType: { type: DataTypes.STRING, defaultValue: 'Medicare' },
  advanceDirective: { type: DataTypes.BOOLEAN, defaultValue: false },
  dnrStatus: { type: DataTypes.BOOLEAN, defaultValue: false },
  funeralPreferences: { type: DataTypes.TEXT },
  legacyProject: { type: DataTypes.TEXT }
});

// Care Plan Model
const CarePlan = sequelize.define('CarePlan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING }, // physician, nurse, social_worker, chaplain, aide
  goals: { type: DataTypes.TEXT },
  interventions: { type: DataTypes.TEXT },
  frequency: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  createdBy: { type: DataTypes.STRING },
  nextReviewDate: { type: DataTypes.DATEONLY }
});

// Visit Model
const Visit = sequelize.define('Visit', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  visitDate: { type: DataTypes.DATE },
  visitType: { type: DataTypes.STRING }, // routine, prn, admission, discharge, death
  clinicianName: { type: DataTypes.STRING },
  clinicianRole: { type: DataTypes.STRING },
  duration: { type: DataTypes.INTEGER }, // minutes
  notes: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'scheduled' }
});

// Medication Model
const Medication = sequelize.define('Medication', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  dosage: { type: DataTypes.STRING },
  route: { type: DataTypes.STRING },
  frequency: { type: DataTypes.STRING },
  purpose: { type: DataTypes.STRING }, // pain, anxiety, nausea, dyspnea, comfort
  isComfortMed: { type: DataTypes.BOOLEAN, defaultValue: false },
  isEmergencyKit: { type: DataTypes.BOOLEAN, defaultValue: false },
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.STRING, defaultValue: 'active' }
});

// Symptom Tracking Model
const SymptomLog = sequelize.define('SymptomLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  painLevel: { type: DataTypes.INTEGER }, // 0-10
  nauseaLevel: { type: DataTypes.INTEGER }, // 0-10
  anxietyLevel: { type: DataTypes.INTEGER }, // 0-10
  dyspneaLevel: { type: DataTypes.INTEGER }, // 0-10
  fatigueLevel: { type: DataTypes.INTEGER }, // 0-10
  notes: { type: DataTypes.TEXT },
  recordedBy: { type: DataTypes.STRING }
});

// Family/Caregiver Model
const FamilyMember = sequelize.define('FamilyMember', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  relationship: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  isPrimaryCaregiver: { type: DataTypes.BOOLEAN, defaultValue: false },
  isPOA: { type: DataTypes.BOOLEAN, defaultValue: false },
  bereavementRisk: { type: DataTypes.STRING, defaultValue: 'normal' },
  notes: { type: DataTypes.TEXT }
});

// Bereavement Model
const Bereavement = sequelize.define('Bereavement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  familyMemberId: { type: DataTypes.INTEGER },
  contactName: { type: DataTypes.STRING },
  riskLevel: { type: DataTypes.STRING, defaultValue: 'normal' },
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
  lastContactDate: { type: DataTypes.DATEONLY },
  monthsCompleted: { type: DataTypes.INTEGER, defaultValue: 0 },
  contactMethod: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'active' }
});

// Volunteer Model
const Volunteer = sequelize.define('Volunteer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  skills: { type: DataTypes.TEXT },
  availability: { type: DataTypes.STRING },
  assignedPatientId: { type: DataTypes.INTEGER },
  hoursLogged: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  backgroundCheck: { type: DataTypes.BOOLEAN, defaultValue: false },
  trainingCompleted: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Staff/On-Call Schedule Model
const Schedule = sequelize.define('Schedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  staffName: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING },
  date: { type: DataTypes.DATEONLY },
  shiftType: { type: DataTypes.STRING }, // day, evening, night, on-call
  startTime: { type: DataTypes.STRING },
  endTime: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'scheduled' },
  notes: { type: DataTypes.TEXT }
});

// DME (Durable Medical Equipment) Model
const Equipment = sequelize.define('Equipment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  equipmentName: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  vendor: { type: DataTypes.STRING },
  orderDate: { type: DataTypes.DATEONLY },
  deliveryDate: { type: DataTypes.DATEONLY },
  returnDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.STRING, defaultValue: 'ordered' },
  notes: { type: DataTypes.TEXT }
});

// Certification/Recertification Model
const Certification = sequelize.define('Certification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  benefitPeriod: { type: DataTypes.INTEGER }, // 1st 90-day, 2nd 90-day, subsequent 60-day
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
  certifyingPhysician: { type: DataTypes.STRING },
  f2fDate: { type: DataTypes.DATEONLY }, // face-to-face encounter date
  f2fPhysician: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  notes: { type: DataTypes.TEXT }
});

// Billing Model
const Billing = sequelize.define('Billing', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  serviceDate: { type: DataTypes.DATEONLY },
  levelOfCare: { type: DataTypes.STRING },
  payerType: { type: DataTypes.STRING }, // Medicare, Medicaid, Private
  claimAmount: { type: DataTypes.FLOAT },
  paidAmount: { type: DataTypes.FLOAT },
  claimStatus: { type: DataTypes.STRING, defaultValue: 'pending' },
  billingCode: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
});

// Quality Measure Model
const QualityMeasure = sequelize.define('QualityMeasure', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  measureType: { type: DataTypes.STRING }, // CAHPS, HIS
  measureName: { type: DataTypes.STRING },
  period: { type: DataTypes.STRING },
  score: { type: DataTypes.FLOAT },
  benchmark: { type: DataTypes.FLOAT },
  patientId: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT }
});

// Spiritual Care Model
const SpiritualCare = sequelize.define('SpiritualCare', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  chaplainName: { type: DataTypes.STRING },
  visitDate: { type: DataTypes.DATE },
  spiritualNeeds: { type: DataTypes.TEXT },
  religiousPreference: { type: DataTypes.STRING },
  ritualRequests: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'active' }
});

// Social Work Assessment Model
const SocialWorkAssessment = sequelize.define('SocialWorkAssessment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER, allowNull: false },
  socialWorkerName: { type: DataTypes.STRING },
  assessmentDate: { type: DataTypes.DATEONLY },
  psychosocialNeeds: { type: DataTypes.TEXT },
  financialConcerns: { type: DataTypes.TEXT },
  communityResources: { type: DataTypes.TEXT },
  familyDynamics: { type: DataTypes.TEXT },
  copingAssessment: { type: DataTypes.TEXT },
  goals: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'active' }
});

// GIP Bed Management Model
const GIPBed = sequelize.define('GIPBed', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  facilityName: { type: DataTypes.STRING },
  bedNumber: { type: DataTypes.STRING },
  patientId: { type: DataTypes.INTEGER },
  admissionDate: { type: DataTypes.DATEONLY },
  dischargeDate: { type: DataTypes.DATEONLY },
  reason: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'available' },
  notes: { type: DataTypes.TEXT }
});

// Supply Management Model
const Supply = sequelize.define('Supply', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  itemName: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER },
  reorderLevel: { type: DataTypes.INTEGER },
  vendor: { type: DataTypes.STRING },
  unitCost: { type: DataTypes.FLOAT },
  lastOrderDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.STRING, defaultValue: 'in_stock' }
});

// Team Meeting Model
const TeamMeeting = sequelize.define('TeamMeeting', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER },
  meetingDate: { type: DataTypes.DATE },
  attendees: { type: DataTypes.TEXT },
  agenda: { type: DataTypes.TEXT },
  discussion: { type: DataTypes.TEXT },
  decisions: { type: DataTypes.TEXT },
  actionItems: { type: DataTypes.TEXT },
  aiSummary: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'scheduled' }
});

// Compliance Documentation Model
const ComplianceDoc = sequelize.define('ComplianceDoc', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  documentType: { type: DataTypes.STRING },
  title: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT },
  patientId: { type: DataTypes.INTEGER },
  dueDate: { type: DataTypes.DATEONLY },
  completedDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  assignedTo: { type: DataTypes.STRING }
});

// PHI Audit Log Model
const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER },
  action: { type: DataTypes.STRING, allowNull: false },
  entity_type: { type: DataTypes.STRING },
  entity_id: { type: DataTypes.INTEGER },
  details: { type: DataTypes.TEXT },
});

// Family Satisfaction Survey Model
const Survey = sequelize.define('Survey', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.INTEGER },
  respondentName: { type: DataTypes.STRING },
  relationship: { type: DataTypes.STRING },
  surveyDate: { type: DataTypes.DATEONLY },
  overallRating: { type: DataTypes.INTEGER },
  painManagement: { type: DataTypes.INTEGER },
  communication: { type: DataTypes.INTEGER },
  emotionalSupport: { type: DataTypes.INTEGER },
  teamResponsiveness: { type: DataTypes.INTEGER },
  comments: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'completed' }
});

// Associations
Patient.hasMany(CarePlan, { foreignKey: 'patientId' });
Patient.hasMany(Visit, { foreignKey: 'patientId' });
Patient.hasMany(Medication, { foreignKey: 'patientId' });
Patient.hasMany(SymptomLog, { foreignKey: 'patientId' });
Patient.hasMany(FamilyMember, { foreignKey: 'patientId' });
Patient.hasMany(Bereavement, { foreignKey: 'patientId' });
Patient.hasMany(Equipment, { foreignKey: 'patientId' });
Patient.hasMany(Certification, { foreignKey: 'patientId' });
Patient.hasMany(Billing, { foreignKey: 'patientId' });
Patient.hasMany(SpiritualCare, { foreignKey: 'patientId' });
Patient.hasMany(SocialWorkAssessment, { foreignKey: 'patientId' });

CarePlan.belongsTo(Patient, { foreignKey: 'patientId' });
Visit.belongsTo(Patient, { foreignKey: 'patientId' });
Medication.belongsTo(Patient, { foreignKey: 'patientId' });
SymptomLog.belongsTo(Patient, { foreignKey: 'patientId' });
FamilyMember.belongsTo(Patient, { foreignKey: 'patientId' });
Bereavement.belongsTo(Patient, { foreignKey: 'patientId' });
Equipment.belongsTo(Patient, { foreignKey: 'patientId' });
Certification.belongsTo(Patient, { foreignKey: 'patientId' });
Billing.belongsTo(Patient, { foreignKey: 'patientId' });
SpiritualCare.belongsTo(Patient, { foreignKey: 'patientId' });
SocialWorkAssessment.belongsTo(Patient, { foreignKey: 'patientId' });

module.exports = {
  sequelize,
  User,
  AuditLog,
  Patient,
  CarePlan,
  Visit,
  Medication,
  SymptomLog,
  FamilyMember,
  Bereavement,
  Volunteer,
  Schedule,
  Equipment,
  Certification,
  Billing,
  QualityMeasure,
  SpiritualCare,
  SocialWorkAssessment,
  GIPBed,
  Supply,
  TeamMeeting,
  ComplianceDoc,
  Survey
};
