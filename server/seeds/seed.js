require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize, User, Patient, CarePlan, Visit, Medication, SymptomLog,
  FamilyMember, Bereavement, Volunteer, Schedule, Equipment, Certification,
  Billing, QualityMeasure, SpiritualCare, SocialWorkAssessment, GIPBed,
  Supply, TeamMeeting, ComplianceDoc, Survey
} = require('../models');

function requireDemoPassword() {
  const password = process.env.DEMO_PASSWORD || process.env.SEED_DEMO_PASSWORD || process.env.DEMO_SEED_PASSWORD || '';
  if (password.length < 12 || password.length > 1024) throw new Error('DEMO_PASSWORD must contain 12-1024 characters');
  return password;
}

async function seed() {
  if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Destructive demo seed refused. Set ALLOW_DEMO_SEED=true outside production.');
  }
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced. Seeding data...');

    // Users (15+)
    const hashedPassword = await bcrypt.hash(requireDemoPassword(), 10);
    const users = await User.bulkCreate([
      { email: 'admin@hospice.com', password: hashedPassword, name: 'Dr. Sarah Mitchell', role: 'admin' },
      { email: 'nurse@hospice.com', password: hashedPassword, name: 'Emily Chen, RN', role: 'nurse' },
      { email: 'doctor@hospice.com', password: hashedPassword, name: 'Dr. James Wilson', role: 'physician' },
      { email: 'social@hospice.com', password: hashedPassword, name: 'Maria Rodriguez, LCSW', role: 'social_worker' },
      { email: 'chaplain@hospice.com', password: hashedPassword, name: 'Rev. David Thompson', role: 'chaplain' },
      { email: 'aide@hospice.com', password: hashedPassword, name: 'Lisa Park, CNA', role: 'aide' },
      { email: 'billing@hospice.com', password: hashedPassword, name: 'Karen White', role: 'billing' },
      { email: 'volunteer@hospice.com', password: hashedPassword, name: 'Tom Bradley', role: 'volunteer_coordinator' },
      { email: 'nurse2@hospice.com', password: hashedPassword, name: 'Jennifer Adams, RN', role: 'nurse' },
      { email: 'nurse3@hospice.com', password: hashedPassword, name: 'Robert Kim, RN', role: 'nurse' },
      { email: 'doctor2@hospice.com', password: hashedPassword, name: 'Dr. Patricia Brown', role: 'physician' },
      { email: 'social2@hospice.com', password: hashedPassword, name: 'Angela Davis, MSW', role: 'social_worker' },
      { email: 'chaplain2@hospice.com', password: hashedPassword, name: 'Sister Mary O\'Brien', role: 'chaplain' },
      { email: 'qa@hospice.com', password: hashedPassword, name: 'Michael Torres', role: 'quality' },
      { email: 'director@hospice.com', password: hashedPassword, name: 'Dr. Helen Foster', role: 'director' },
    ]);

    // Patients (15+)
    const patients = await Patient.bulkCreate([
      { firstName: 'Margaret', lastName: 'Johnson', dateOfBirth: '1938-03-15', gender: 'Female', admissionDate: '2025-12-01', diagnosis: 'End-stage congestive heart failure (NYHA Class IV)', prognosis: '6 months or less', status: 'active', levelOfCare: 'routine', primaryPhysician: 'Dr. James Wilson', address: '123 Oak Lane, Springfield, IL 62701', phone: '555-0101', insuranceType: 'Medicare', advanceDirective: true, dnrStatus: true, funeralPreferences: 'Cremation, memorial service at First Baptist Church', legacyProject: 'Writing letters to grandchildren' },
      { firstName: 'Robert', lastName: 'Williams', dateOfBirth: '1945-07-22', gender: 'Male', admissionDate: '2025-11-15', diagnosis: 'Metastatic pancreatic cancer, Stage IV', prognosis: '3 months or less', status: 'active', levelOfCare: 'continuous', primaryPhysician: 'Dr. Patricia Brown', address: '456 Maple Street, Springfield, IL 62702', phone: '555-0102', insuranceType: 'Medicare', advanceDirective: true, dnrStatus: true, funeralPreferences: 'Military honors burial at National Cemetery', legacyProject: 'Recording oral history for family archive' },
      { firstName: 'Dorothy', lastName: 'Davis', dateOfBirth: '1932-11-08', gender: 'Female', admissionDate: '2026-01-10', diagnosis: 'Advanced Alzheimer disease with failure to thrive', prognosis: '6 months or less', status: 'active', levelOfCare: 'routine', primaryPhysician: 'Dr. James Wilson', address: '789 Elm Drive, Springfield, IL 62703', phone: '555-0103', insuranceType: 'Medicare', advanceDirective: true, dnrStatus: true, funeralPreferences: 'Traditional burial, family plot at Graceland Cemetery' },
      { firstName: 'James', lastName: 'Anderson', dateOfBirth: '1940-05-30', gender: 'Male', admissionDate: '2026-01-20', diagnosis: 'End-stage COPD with cor pulmonale', prognosis: '6 months or less', status: 'active', levelOfCare: 'routine', primaryPhysician: 'Dr. Patricia Brown', address: '321 Pine Road, Springfield, IL 62704', phone: '555-0104', insuranceType: 'Medicaid', advanceDirective: true, dnrStatus: false, funeralPreferences: 'Cremation, ashes scattered at Lake Springfield' },
      { firstName: 'Helen', lastName: 'Martinez', dateOfBirth: '1935-09-12', gender: 'Female', admissionDate: '2026-02-01', diagnosis: 'End-stage renal disease, declined dialysis', prognosis: '3 months or less', status: 'active', levelOfCare: 'GIP', primaryPhysician: 'Dr. James Wilson', address: '654 Cedar Court, Springfield, IL 62705', phone: '555-0105', insuranceType: 'Medicare', advanceDirective: true, dnrStatus: true, funeralPreferences: 'Catholic funeral mass, burial at Calvary Cemetery' },
      { firstName: 'William', lastName: 'Taylor', dateOfBirth: '1942-01-25', gender: 'Male', admissionDate: '2025-10-15', diagnosis: 'Hepatocellular carcinoma with cirrhosis', prognosis: '6 months or less', status: 'active', levelOfCare: 'routine', primaryPhysician: 'Dr. Patricia Brown', address: '987 Birch Lane, Springfield, IL 62706', phone: '555-0106', insuranceType: 'Private', advanceDirective: false, dnrStatus: false },
      { firstName: 'Patricia', lastName: 'Thomas', dateOfBirth: '1929-12-03', gender: 'Female', admissionDate: '2026-02-15', diagnosis: 'End-stage Parkinson disease with aspiration pneumonia', prognosis: '6 months or less', status: 'active', levelOfCare: 'routine', primaryPhysician: 'Dr. James Wilson', address: '147 Walnut Street, Springfield, IL 62707', phone: '555-0107', insuranceType: 'Medicare', advanceDirective: true, dnrStatus: true },
      { firstName: 'Richard', lastName: 'Garcia', dateOfBirth: '1937-06-18', gender: 'Male', admissionDate: '2026-03-01', diagnosis: 'Metastatic lung cancer (NSCLC) with brain metastases', prognosis: '3 months or less', status: 'active', levelOfCare: 'continuous', primaryPhysician: 'Dr. Patricia Brown', address: '258 Spruce Avenue, Springfield, IL 62708', phone: '555-0108', insuranceType: 'Medicare', advanceDirective: true, dnrStatus: true },
      { firstName: 'Barbara', lastName: 'Brown', dateOfBirth: '1944-04-07', gender: 'Female', admissionDate: '2026-01-05', diagnosis: 'ALS (amyotrophic lateral sclerosis)', prognosis: '6 months or less', status: 'active', levelOfCare: 'routine', primaryPhysician: 'Dr. James Wilson', address: '369 Ash Court, Springfield, IL 62709', phone: '555-0109', insuranceType: 'Medicare', advanceDirective: true, dnrStatus: true, legacyProject: 'Creating a photo album with voice recordings' },
      { firstName: 'Charles', lastName: 'Wilson', dateOfBirth: '1950-08-14', gender: 'Male', admissionDate: '2026-02-20', diagnosis: 'End-stage heart failure with ICD deactivated', prognosis: '6 months or less', status: 'active', levelOfCare: 'routine', primaryPhysician: 'Dr. Patricia Brown', address: '741 Dogwood Lane, Springfield, IL 62710', phone: '555-0110', insuranceType: 'Medicare', advanceDirective: true, dnrStatus: true },
      { firstName: 'Frances', lastName: 'Moore', dateOfBirth: '1930-02-28', gender: 'Female', admissionDate: '2025-09-01', diagnosis: 'Advanced dementia with recurrent UTIs', prognosis: '6 months or less', status: 'deceased', levelOfCare: 'routine', primaryPhysician: 'Dr. James Wilson', address: '852 Hickory Road, Springfield, IL 62711', phone: '555-0111', insuranceType: 'Medicare', advanceDirective: true, dnrStatus: true },
      { firstName: 'George', lastName: 'Jackson', dateOfBirth: '1948-10-20', gender: 'Male', admissionDate: '2026-03-10', diagnosis: 'Metastatic colon cancer with liver metastases', prognosis: '3 months or less', status: 'active', levelOfCare: 'routine', primaryPhysician: 'Dr. Patricia Brown', address: '963 Poplar Street, Springfield, IL 62712', phone: '555-0112', insuranceType: 'Medicaid', advanceDirective: false, dnrStatus: false },
      { firstName: 'Ruth', lastName: 'White', dateOfBirth: '1933-07-09', gender: 'Female', admissionDate: '2025-11-01', diagnosis: 'End-stage breast cancer with bone metastases', prognosis: '6 months or less', status: 'active', levelOfCare: 'respite', primaryPhysician: 'Dr. James Wilson', address: '174 Willow Drive, Springfield, IL 62713', phone: '555-0113', insuranceType: 'Medicare', advanceDirective: true, dnrStatus: true },
      { firstName: 'Edward', lastName: 'Harris', dateOfBirth: '1946-03-11', gender: 'Male', admissionDate: '2026-01-15', diagnosis: 'End-stage liver disease (ESLD) with hepatorenal syndrome', prognosis: '3 months or less', status: 'active', levelOfCare: 'routine', primaryPhysician: 'Dr. Patricia Brown', address: '285 Sycamore Lane, Springfield, IL 62714', phone: '555-0114', insuranceType: 'Private', advanceDirective: true, dnrStatus: true },
      { firstName: 'Mary', lastName: 'Clark', dateOfBirth: '1936-12-25', gender: 'Female', admissionDate: '2026-02-10', diagnosis: 'Glioblastoma multiforme, grade IV', prognosis: '3 months or less', status: 'active', levelOfCare: 'GIP', primaryPhysician: 'Dr. James Wilson', address: '396 Magnolia Court, Springfield, IL 62715', phone: '555-0115', insuranceType: 'Medicare', advanceDirective: true, dnrStatus: true, funeralPreferences: 'Green burial, natural cemetery', legacyProject: 'Painting watercolors for each family member' },
    ]);

    // Care Plans (15+)
    await CarePlan.bulkCreate([
      { patientId: 1, type: 'physician', goals: 'Manage CHF symptoms, optimize comfort medications', interventions: 'Weekly physician visits, medication titration, symptom monitoring', frequency: 'Weekly', status: 'active', createdBy: 'Dr. James Wilson', nextReviewDate: '2026-04-01' },
      { patientId: 1, type: 'nurse', goals: 'Pain management, edema monitoring, caregiver education', interventions: 'Vital signs, weight monitoring, medication management, wound care PRN', frequency: '3x weekly', status: 'active', createdBy: 'Emily Chen, RN', nextReviewDate: '2026-04-01' },
      { patientId: 1, type: 'social_worker', goals: 'Advance care planning completion, family support', interventions: 'Counseling sessions, resource referrals, family meetings', frequency: 'Bi-weekly', status: 'active', createdBy: 'Maria Rodriguez, LCSW', nextReviewDate: '2026-04-15' },
      { patientId: 2, type: 'physician', goals: 'Aggressive pain management for pancreatic cancer pain', interventions: 'Opioid titration, adjuvant therapy, interventional pain referral', frequency: '2x weekly', status: 'active', createdBy: 'Dr. Patricia Brown', nextReviewDate: '2026-04-01' },
      { patientId: 2, type: 'nurse', goals: 'Continuous care management, crisis prevention', interventions: 'Continuous nursing assessment, IV medications, family support', frequency: 'Daily', status: 'active', createdBy: 'Jennifer Adams, RN', nextReviewDate: '2026-03-30' },
      { patientId: 3, type: 'aide', goals: 'Personal care, safety, comfort', interventions: 'Bathing, dressing, feeding assistance, repositioning', frequency: '5x weekly', status: 'active', createdBy: 'Lisa Park, CNA', nextReviewDate: '2026-04-10' },
      { patientId: 4, type: 'nurse', goals: 'Dyspnea management, oxygen therapy optimization', interventions: 'Respiratory assessment, O2 titration, breathing techniques', frequency: '3x weekly', status: 'active', createdBy: 'Robert Kim, RN', nextReviewDate: '2026-04-05' },
      { patientId: 5, type: 'chaplain', goals: 'Spiritual support, sacramental care', interventions: 'Pastoral visits, prayer, communion, anointing of the sick', frequency: 'Weekly', status: 'active', createdBy: 'Rev. David Thompson', nextReviewDate: '2026-04-01' },
      { patientId: 5, type: 'physician', goals: 'Uremia symptom management, comfort care', interventions: 'Symptom monitoring, anti-emetic therapy, fluid management', frequency: '2x weekly', status: 'active', createdBy: 'Dr. James Wilson', nextReviewDate: '2026-03-28' },
      { patientId: 7, type: 'nurse', goals: 'Aspiration prevention, mobility support', interventions: 'Swallow assessment, positioning, fall prevention', frequency: '3x weekly', status: 'active', createdBy: 'Emily Chen, RN', nextReviewDate: '2026-04-15' },
      { patientId: 8, type: 'social_worker', goals: 'Family coping support, anticipatory grief', interventions: 'Family counseling, coping strategies, legacy planning', frequency: 'Weekly', status: 'active', createdBy: 'Angela Davis, MSW', nextReviewDate: '2026-04-01' },
      { patientId: 9, type: 'nurse', goals: 'ALS symptom progression monitoring, respiratory support', interventions: 'Non-invasive ventilation assessment, communication aids, mobility support', frequency: '3x weekly', status: 'active', createdBy: 'Emily Chen, RN', nextReviewDate: '2026-04-10' },
      { patientId: 10, type: 'physician', goals: 'Cardiac comfort care post-ICD deactivation', interventions: 'Symptom management, diuretic optimization, family education', frequency: 'Weekly', status: 'active', createdBy: 'Dr. Patricia Brown', nextReviewDate: '2026-04-05' },
      { patientId: 12, type: 'nurse', goals: 'Cancer pain management, nutritional support', interventions: 'Pain assessment, opioid management, appetite monitoring', frequency: '3x weekly', status: 'active', createdBy: 'Robert Kim, RN', nextReviewDate: '2026-04-01' },
      { patientId: 15, type: 'physician', goals: 'GBM symptom management, seizure prevention', interventions: 'Steroid management, anti-seizure medication, neurological assessment', frequency: '2x weekly', status: 'active', createdBy: 'Dr. James Wilson', nextReviewDate: '2026-03-30' },
    ]);

    // Visits (15+)
    await Visit.bulkCreate([
      { patientId: 1, visitDate: '2026-03-20T09:00:00', visitType: 'routine', clinicianName: 'Emily Chen, RN', clinicianRole: 'nurse', duration: 45, notes: 'Stable. Edema 2+ bilateral LE. Pain 3/10 controlled with current meds.', status: 'completed' },
      { patientId: 1, visitDate: '2026-03-23T10:00:00', visitType: 'routine', clinicianName: 'Dr. James Wilson', clinicianRole: 'physician', duration: 30, notes: 'Weekly physician visit. Adjusted Lasix dose. Family meeting scheduled.', status: 'scheduled' },
      { patientId: 2, visitDate: '2026-03-22T08:00:00', visitType: 'routine', clinicianName: 'Jennifer Adams, RN', clinicianRole: 'nurse', duration: 60, notes: 'Continuous care assessment. Pain escalating, 7/10. Fentanyl patch increased.', status: 'completed' },
      { patientId: 2, visitDate: '2026-03-23T14:00:00', visitType: 'prn', clinicianName: 'Dr. Patricia Brown', clinicianRole: 'physician', duration: 45, notes: 'Urgent visit for uncontrolled pain. Adding ketamine protocol.', status: 'scheduled' },
      { patientId: 3, visitDate: '2026-03-21T10:00:00', visitType: 'routine', clinicianName: 'Lisa Park, CNA', clinicianRole: 'aide', duration: 90, notes: 'Personal care provided. Patient calm today, ate 50% breakfast.', status: 'completed' },
      { patientId: 4, visitDate: '2026-03-22T13:00:00', visitType: 'routine', clinicianName: 'Robert Kim, RN', clinicianRole: 'nurse', duration: 45, notes: 'Increased dyspnea at rest. O2 increased to 4L NC. SpO2 89% on RA.', status: 'completed' },
      { patientId: 5, visitDate: '2026-03-21T15:00:00', visitType: 'routine', clinicianName: 'Rev. David Thompson', clinicianRole: 'chaplain', duration: 40, notes: 'Communion provided. Patient expressed peace with end-of-life.', status: 'completed' },
      { patientId: 5, visitDate: '2026-03-23T09:00:00', visitType: 'routine', clinicianName: 'Emily Chen, RN', clinicianRole: 'nurse', duration: 50, notes: 'GIP assessment. Nausea 6/10, vomiting x2 today. Zofran given IV.', status: 'scheduled' },
      { patientId: 7, visitDate: '2026-03-20T11:00:00', visitType: 'routine', clinicianName: 'Emily Chen, RN', clinicianRole: 'nurse', duration: 45, notes: 'Swallowing deteriorating. Speech therapy consult recommended.', status: 'completed' },
      { patientId: 8, visitDate: '2026-03-22T09:00:00', visitType: 'routine', clinicianName: 'Angela Davis, MSW', clinicianRole: 'social_worker', duration: 55, notes: 'Family counseling session. Wife expressing anticipatory grief.', status: 'completed' },
      { patientId: 9, visitDate: '2026-03-21T14:00:00', visitType: 'routine', clinicianName: 'Emily Chen, RN', clinicianRole: 'nurse', duration: 50, notes: 'FVC declining. Discussed BiPAP vs comfort measures with patient.', status: 'completed' },
      { patientId: 10, visitDate: '2026-03-23T11:00:00', visitType: 'routine', clinicianName: 'Dr. Patricia Brown', clinicianRole: 'physician', duration: 30, notes: 'Post-ICD deactivation follow-up. Adjusting diuretics.', status: 'scheduled' },
      { patientId: 12, visitDate: '2026-03-22T10:00:00', visitType: 'routine', clinicianName: 'Robert Kim, RN', clinicianRole: 'nurse', duration: 45, notes: 'Abdominal pain increasing. Bowel obstruction symptoms monitored.', status: 'completed' },
      { patientId: 14, visitDate: '2026-03-23T13:00:00', visitType: 'routine', clinicianName: 'Jennifer Adams, RN', clinicianRole: 'nurse', duration: 40, notes: 'Jaundice worsening. Lactulose adjusted. Family educated on signs.', status: 'scheduled' },
      { patientId: 15, visitDate: '2026-03-22T15:00:00', visitType: 'routine', clinicianName: 'Dr. James Wilson', clinicianRole: 'physician', duration: 45, notes: 'GIP review. Seizure activity increased. Keppra dose adjusted.', status: 'completed' },
    ]);

    // Medications (15+)
    await Medication.bulkCreate([
      { patientId: 1, name: 'Morphine Sulfate IR', dosage: '15mg', route: 'oral', frequency: 'q4h PRN', purpose: 'pain', isComfortMed: true, isEmergencyKit: false, startDate: '2025-12-01', status: 'active' },
      { patientId: 1, name: 'Furosemide', dosage: '80mg', route: 'oral', frequency: 'BID', purpose: 'edema', isComfortMed: false, startDate: '2025-12-01', status: 'active' },
      { patientId: 2, name: 'Fentanyl Patch', dosage: '100mcg/hr', route: 'transdermal', frequency: 'q72h', purpose: 'pain', isComfortMed: true, startDate: '2025-11-15', status: 'active' },
      { patientId: 2, name: 'Hydromorphone', dosage: '4mg', route: 'oral', frequency: 'q3h PRN', purpose: 'pain', isComfortMed: true, isEmergencyKit: true, startDate: '2025-11-15', status: 'active' },
      { patientId: 2, name: 'Ondansetron', dosage: '8mg', route: 'IV', frequency: 'q8h', purpose: 'nausea', isComfortMed: true, startDate: '2026-01-10', status: 'active' },
      { patientId: 3, name: 'Lorazepam', dosage: '0.5mg', route: 'sublingual', frequency: 'q6h PRN', purpose: 'anxiety', isComfortMed: true, isEmergencyKit: true, startDate: '2026-01-10', status: 'active' },
      { patientId: 4, name: 'Albuterol', dosage: '2.5mg', route: 'nebulizer', frequency: 'q4h PRN', purpose: 'dyspnea', isComfortMed: true, startDate: '2026-01-20', status: 'active' },
      { patientId: 4, name: 'Morphine Sulfate', dosage: '5mg', route: 'oral', frequency: 'q4h PRN', purpose: 'dyspnea', isComfortMed: true, isEmergencyKit: true, startDate: '2026-01-20', status: 'active' },
      { patientId: 5, name: 'Haloperidol', dosage: '1mg', route: 'oral', frequency: 'q8h PRN', purpose: 'nausea', isComfortMed: true, isEmergencyKit: true, startDate: '2026-02-01', status: 'active' },
      { patientId: 7, name: 'Carbidopa/Levodopa', dosage: '25/100mg', route: 'oral', frequency: 'TID', purpose: 'comfort', isComfortMed: false, startDate: '2026-02-15', status: 'active' },
      { patientId: 8, name: 'Dexamethasone', dosage: '4mg', route: 'oral', frequency: 'BID', purpose: 'comfort', isComfortMed: true, startDate: '2026-03-01', status: 'active' },
      { patientId: 9, name: 'Baclofen', dosage: '10mg', route: 'oral', frequency: 'TID', purpose: 'comfort', isComfortMed: true, startDate: '2026-01-05', status: 'active' },
      { patientId: 12, name: 'Oxycodone', dosage: '10mg', route: 'oral', frequency: 'q4h', purpose: 'pain', isComfortMed: true, startDate: '2026-03-10', status: 'active' },
      { patientId: 14, name: 'Lactulose', dosage: '30ml', route: 'oral', frequency: 'TID', purpose: 'comfort', isComfortMed: false, startDate: '2026-01-15', status: 'active' },
      { patientId: 15, name: 'Levetiracetam', dosage: '1000mg', route: 'oral', frequency: 'BID', purpose: 'comfort', isComfortMed: false, startDate: '2026-02-10', status: 'active' },
      { patientId: 15, name: 'Dexamethasone', dosage: '8mg', route: 'oral', frequency: 'Daily', purpose: 'comfort', isComfortMed: true, startDate: '2026-02-10', status: 'active' },
    ]);

    // Symptom Logs (15+)
    await SymptomLog.bulkCreate([
      { patientId: 1, date: '2026-03-20T09:00:00', painLevel: 3, nauseaLevel: 1, anxietyLevel: 4, dyspneaLevel: 5, fatigueLevel: 6, notes: 'Moderate dyspnea with exertion', recordedBy: 'Emily Chen, RN' },
      { patientId: 1, date: '2026-03-18T09:00:00', painLevel: 4, nauseaLevel: 2, anxietyLevel: 5, dyspneaLevel: 6, fatigueLevel: 7, notes: 'Increased anxiety about family', recordedBy: 'Emily Chen, RN' },
      { patientId: 2, date: '2026-03-22T08:00:00', painLevel: 7, nauseaLevel: 5, anxietyLevel: 6, dyspneaLevel: 3, fatigueLevel: 8, notes: 'Pain breakthrough despite increased patch. Nausea worsening.', recordedBy: 'Jennifer Adams, RN' },
      { patientId: 2, date: '2026-03-20T08:00:00', painLevel: 6, nauseaLevel: 4, anxietyLevel: 5, dyspneaLevel: 2, fatigueLevel: 7, notes: 'Pain somewhat controlled. Eating minimal amounts.', recordedBy: 'Jennifer Adams, RN' },
      { patientId: 3, date: '2026-03-21T10:00:00', painLevel: 2, nauseaLevel: 1, anxietyLevel: 3, dyspneaLevel: 1, fatigueLevel: 5, notes: 'Calm today, recognized daughter briefly', recordedBy: 'Lisa Park, CNA' },
      { patientId: 4, date: '2026-03-22T13:00:00', painLevel: 2, nauseaLevel: 0, anxietyLevel: 7, dyspneaLevel: 8, fatigueLevel: 9, notes: 'Severe dyspnea at rest. Very anxious about breathing.', recordedBy: 'Robert Kim, RN' },
      { patientId: 5, date: '2026-03-21T15:00:00', painLevel: 4, nauseaLevel: 6, anxietyLevel: 3, dyspneaLevel: 2, fatigueLevel: 7, notes: 'Nausea persistent. Vomited x2. Drowsy.', recordedBy: 'Emily Chen, RN' },
      { patientId: 7, date: '2026-03-20T11:00:00', painLevel: 3, nauseaLevel: 4, anxietyLevel: 2, dyspneaLevel: 3, fatigueLevel: 8, notes: 'Dysphagia worsening. Drooling increasing.', recordedBy: 'Emily Chen, RN' },
      { patientId: 8, date: '2026-03-22T09:00:00', painLevel: 5, nauseaLevel: 3, anxietyLevel: 4, dyspneaLevel: 4, fatigueLevel: 7, notes: 'Headache increasing, possibly from brain mets', recordedBy: 'Jennifer Adams, RN' },
      { patientId: 9, date: '2026-03-21T14:00:00', painLevel: 2, nauseaLevel: 1, anxietyLevel: 5, dyspneaLevel: 6, fatigueLevel: 8, notes: 'Breathing harder. Fasciculations in upper extremities.', recordedBy: 'Emily Chen, RN' },
      { patientId: 10, date: '2026-03-22T11:00:00', painLevel: 3, nauseaLevel: 2, anxietyLevel: 4, dyspneaLevel: 5, fatigueLevel: 7, notes: 'Orthopnea at 3 pillows. Peripheral edema 3+.', recordedBy: 'Robert Kim, RN' },
      { patientId: 12, date: '2026-03-22T10:00:00', painLevel: 6, nauseaLevel: 5, anxietyLevel: 3, dyspneaLevel: 1, fatigueLevel: 6, notes: 'Abdominal pain increasing. Distension noted.', recordedBy: 'Robert Kim, RN' },
      { patientId: 13, date: '2026-03-20T09:00:00', painLevel: 5, nauseaLevel: 2, anxietyLevel: 3, dyspneaLevel: 2, fatigueLevel: 7, notes: 'Bone pain in lower back and hips', recordedBy: 'Emily Chen, RN' },
      { patientId: 14, date: '2026-03-21T14:00:00', painLevel: 4, nauseaLevel: 4, anxietyLevel: 3, dyspneaLevel: 2, fatigueLevel: 8, notes: 'Jaundice deepening. Ascites increasing.', recordedBy: 'Jennifer Adams, RN' },
      { patientId: 15, date: '2026-03-22T15:00:00', painLevel: 6, nauseaLevel: 3, anxietyLevel: 5, dyspneaLevel: 2, fatigueLevel: 7, notes: 'Seizure activity x1 today. Headache severe.', recordedBy: 'Emily Chen, RN' },
    ]);

    // Family Members (15+)
    await FamilyMember.bulkCreate([
      { patientId: 1, name: 'Susan Johnson', relationship: 'Daughter', phone: '555-0201', email: 'susan.j@email.com', isPrimaryCaregiver: true, isPOA: true, bereavementRisk: 'high', notes: 'Lives with patient. Very involved in care.' },
      { patientId: 1, name: 'Michael Johnson', relationship: 'Son', phone: '555-0202', email: 'michael.j@email.com', isPrimaryCaregiver: false, isPOA: false, bereavementRisk: 'normal', notes: 'Lives out of state. Calls daily.' },
      { patientId: 2, name: 'Carol Williams', relationship: 'Wife', phone: '555-0203', email: 'carol.w@email.com', isPrimaryCaregiver: true, isPOA: true, bereavementRisk: 'high', notes: 'Married 52 years. Showing signs of caregiver burnout.' },
      { patientId: 2, name: 'David Williams', relationship: 'Son', phone: '555-0204', email: 'david.w@email.com', isPrimaryCaregiver: false, isPOA: false, bereavementRisk: 'normal', notes: 'Military background, helps with VA benefits.' },
      { patientId: 3, name: 'Linda Davis-Smith', relationship: 'Daughter', phone: '555-0205', email: 'linda.ds@email.com', isPrimaryCaregiver: true, isPOA: true, bereavementRisk: 'high', notes: 'Struggling with mother not recognizing her.' },
      { patientId: 4, name: 'Thomas Anderson', relationship: 'Son', phone: '555-0206', email: 'tom.a@email.com', isPrimaryCaregiver: true, isPOA: true, bereavementRisk: 'normal', notes: 'Retired, providing daily caregiving.' },
      { patientId: 5, name: 'Maria Martinez-Lopez', relationship: 'Daughter', phone: '555-0207', email: 'maria.ml@email.com', isPrimaryCaregiver: true, isPOA: true, bereavementRisk: 'high', notes: 'Bilingual Spanish/English. Cultural liaison needed.' },
      { patientId: 7, name: 'Katherine Thomas', relationship: 'Daughter', phone: '555-0208', email: 'kathy.t@email.com', isPrimaryCaregiver: true, isPOA: true, bereavementRisk: 'normal', notes: 'Healthcare worker, understands medical terminology.' },
      { patientId: 8, name: 'Elena Garcia', relationship: 'Wife', phone: '555-0209', email: 'elena.g@email.com', isPrimaryCaregiver: true, isPOA: true, bereavementRisk: 'high', notes: 'Anticipatory grief, requesting counseling.' },
      { patientId: 9, name: 'Mark Brown', relationship: 'Husband', phone: '555-0210', email: 'mark.b@email.com', isPrimaryCaregiver: true, isPOA: true, bereavementRisk: 'high', notes: 'Helping with legacy photo album project.' },
      { patientId: 10, name: 'Sarah Wilson', relationship: 'Wife', phone: '555-0211', email: 'sarah.w@email.com', isPrimaryCaregiver: true, isPOA: true, bereavementRisk: 'normal', notes: 'Adjusting to life post-ICD deactivation decision.' },
      { patientId: 11, name: 'Patricia Moore-Bell', relationship: 'Daughter', phone: '555-0212', email: 'pat.mb@email.com', isPrimaryCaregiver: false, isPOA: true, bereavementRisk: 'high', notes: 'In bereavement program following mother\'s death.' },
      { patientId: 12, name: 'Robert Jackson Jr', relationship: 'Son', phone: '555-0213', email: 'rob.j@email.com', isPrimaryCaregiver: true, isPOA: true, bereavementRisk: 'normal', notes: 'Needs help navigating Medicaid paperwork.' },
      { patientId: 14, name: 'Catherine Harris', relationship: 'Wife', phone: '555-0214', email: 'cathy.h@email.com', isPrimaryCaregiver: true, isPOA: true, bereavementRisk: 'high', notes: 'History of depression. Close monitoring needed.' },
      { patientId: 15, name: 'James Clark Jr', relationship: 'Son', phone: '555-0215', email: 'james.cj@email.com', isPrimaryCaregiver: true, isPOA: true, bereavementRisk: 'normal', notes: 'Coordinating with siblings for 24/7 vigil rotation.' },
    ]);

    // Bereavement Records (15+)
    await Bereavement.bulkCreate([
      { patientId: 11, familyMemberId: 12, contactName: 'Patricia Moore-Bell', riskLevel: 'high', startDate: '2025-12-15', endDate: '2027-01-15', lastContactDate: '2026-03-15', monthsCompleted: 3, contactMethod: 'Phone call', notes: 'Daughter struggling significantly. Referred to grief counselor.', status: 'active' },
      { patientId: 11, contactName: 'Steven Moore', riskLevel: 'normal', startDate: '2025-12-15', endDate: '2027-01-15', lastContactDate: '2026-03-10', monthsCompleted: 3, contactMethod: 'Card mailed', notes: 'Son coping well with support from church community.', status: 'active' },
      { patientId: 1, contactName: 'Susan Johnson (Pre-bereavement)', riskLevel: 'high', startDate: '2026-03-01', lastContactDate: '2026-03-18', monthsCompleted: 0, contactMethod: 'In-person', notes: 'Pre-bereavement counseling started. High anticipatory grief.', status: 'active' },
      { patientId: 2, contactName: 'Carol Williams (Pre-bereavement)', riskLevel: 'high', startDate: '2026-03-05', lastContactDate: '2026-03-20', monthsCompleted: 0, contactMethod: 'In-person', notes: 'Caregiver burnout symptoms. Referred to support group.', status: 'active' },
      { patientId: 3, contactName: 'Linda Davis-Smith (Pre-bereavement)', riskLevel: 'high', startDate: '2026-02-01', lastContactDate: '2026-03-15', monthsCompleted: 1, contactMethod: 'Phone call', notes: 'Ambiguous grief due to dementia. Special resources provided.', status: 'active' },
      { patientId: 5, contactName: 'Maria Martinez-Lopez (Pre-bereavement)', riskLevel: 'high', startDate: '2026-03-01', lastContactDate: '2026-03-20', monthsCompleted: 0, contactMethod: 'In-person', notes: 'Spanish-language grief resources provided.', status: 'active' },
      { patientId: 8, contactName: 'Elena Garcia (Pre-bereavement)', riskLevel: 'high', startDate: '2026-03-10', lastContactDate: '2026-03-22', monthsCompleted: 0, contactMethod: 'In-person', notes: 'Requesting individual counseling sessions.', status: 'active' },
      { patientId: 9, contactName: 'Mark Brown (Pre-bereavement)', riskLevel: 'high', startDate: '2026-02-15', lastContactDate: '2026-03-18', monthsCompleted: 1, contactMethod: 'In-person', notes: 'Involved in legacy project, finding it therapeutic.', status: 'active' },
      { patientId: 10, contactName: 'Sarah Wilson (Pre-bereavement)', riskLevel: 'normal', startDate: '2026-03-01', lastContactDate: '2026-03-15', monthsCompleted: 0, contactMethod: 'Phone call', notes: 'Adjusting well. Strong family support system.', status: 'active' },
      { patientId: 14, contactName: 'Catherine Harris (Pre-bereavement)', riskLevel: 'high', startDate: '2026-02-01', lastContactDate: '2026-03-20', monthsCompleted: 1, contactMethod: 'In-person', notes: 'History of depression. Psychiatric referral made.', status: 'active' },
      { patientId: 15, contactName: 'James Clark Jr (Pre-bereavement)', riskLevel: 'normal', startDate: '2026-03-01', lastContactDate: '2026-03-15', monthsCompleted: 0, contactMethod: 'Phone call', notes: 'Coping through organizing vigil schedule.', status: 'active' },
      { patientId: 11, contactName: 'Grandchildren - Moore family', riskLevel: 'normal', startDate: '2025-12-15', endDate: '2027-01-15', lastContactDate: '2026-02-14', monthsCompleted: 2, contactMethod: 'Age-appropriate materials mailed', notes: 'Sent age-appropriate grief booklets. Ages 8 and 12.', status: 'active' },
      { patientId: 7, contactName: 'Katherine Thomas (Pre-bereavement)', riskLevel: 'normal', startDate: '2026-03-15', lastContactDate: '2026-03-20', monthsCompleted: 0, contactMethod: 'In-person', notes: 'Healthcare background helping her process. Supportive.', status: 'active' },
      { patientId: 4, contactName: 'Thomas Anderson (Pre-bereavement)', riskLevel: 'normal', startDate: '2026-02-15', lastContactDate: '2026-03-18', monthsCompleted: 1, contactMethod: 'Phone call', notes: 'Managing well. Strong faith support.', status: 'active' },
      { patientId: 12, contactName: 'Robert Jackson Jr (Pre-bereavement)', riskLevel: 'normal', startDate: '2026-03-15', lastContactDate: '2026-03-20', monthsCompleted: 0, contactMethod: 'In-person', notes: 'Practical focus - needs help with financial planning.', status: 'active' },
    ]);

    // Volunteers (15+)
    await Volunteer.bulkCreate([
      { name: 'Alice Harper', phone: '555-0301', email: 'alice.h@email.com', skills: 'Music therapy, guitar playing', availability: 'Tue/Thu afternoons', assignedPatientId: 1, hoursLogged: 45.5, status: 'active', backgroundCheck: true, trainingCompleted: true },
      { name: 'Bob Reynolds', phone: '555-0302', email: 'bob.r@email.com', skills: 'Pet therapy (certified therapy dog)', availability: 'Mon/Wed/Fri mornings', assignedPatientId: 3, hoursLogged: 62.0, status: 'active', backgroundCheck: true, trainingCompleted: true },
      { name: 'Claire Mitchell', phone: '555-0303', email: 'claire.m@email.com', skills: 'Companionship, reading aloud', availability: 'Weekday mornings', assignedPatientId: 9, hoursLogged: 38.0, status: 'active', backgroundCheck: true, trainingCompleted: true },
      { name: 'Daniel Foster', phone: '555-0304', email: 'dan.f@email.com', skills: 'Veteran-to-veteran support', availability: 'Flexible', assignedPatientId: 2, hoursLogged: 22.5, status: 'active', backgroundCheck: true, trainingCompleted: true },
      { name: 'Emma Watson', phone: '555-0305', email: 'emma.w@email.com', skills: 'Art therapy, crafts', availability: 'Sat/Sun', assignedPatientId: 15, hoursLogged: 15.0, status: 'active', backgroundCheck: true, trainingCompleted: true },
      { name: 'Frank Morrison', phone: '555-0306', email: 'frank.m@email.com', skills: 'Spiritual support, prayer partner', availability: 'Weekday evenings', assignedPatientId: 5, hoursLogged: 30.0, status: 'active', backgroundCheck: true, trainingCompleted: true },
      { name: 'Grace Lee', phone: '555-0307', email: 'grace.l@email.com', skills: 'Massage therapy (certified)', availability: 'Wed/Fri afternoons', hoursLogged: 28.5, status: 'active', backgroundCheck: true, trainingCompleted: true },
      { name: 'Henry Collins', phone: '555-0308', email: 'henry.c@email.com', skills: 'Bereavement support, grief counseling background', availability: 'Mon/Wed', hoursLogged: 55.0, status: 'active', backgroundCheck: true, trainingCompleted: true },
      { name: 'Isabel Nguyen', phone: '555-0309', email: 'isabel.n@email.com', skills: 'Bilingual Spanish, companionship', availability: 'Tue/Thu mornings', assignedPatientId: 5, hoursLogged: 18.0, status: 'active', backgroundCheck: true, trainingCompleted: true },
      { name: 'Jack O\'Brien', phone: '555-0310', email: 'jack.ob@email.com', skills: 'Administrative support, data entry', availability: 'Mon-Fri mornings', hoursLogged: 120.0, status: 'active', backgroundCheck: true, trainingCompleted: true },
      { name: 'Karen Phillips', phone: '555-0311', email: 'karen.p@email.com', skills: 'Legacy project support, scrapbooking', availability: 'Thu/Sat', assignedPatientId: 9, hoursLogged: 25.0, status: 'active', backgroundCheck: true, trainingCompleted: true },
      { name: 'Larry Thompson', phone: '555-0312', email: 'larry.t@email.com', skills: 'Transportation, errands', availability: 'Flexible weekdays', hoursLogged: 40.0, status: 'active', backgroundCheck: true, trainingCompleted: true },
      { name: 'Monica Young', phone: '555-0313', email: 'monica.y@email.com', skills: 'Respite care, caregiver relief', availability: 'Weekends', hoursLogged: 35.0, status: 'active', backgroundCheck: true, trainingCompleted: true },
      { name: 'Nathan Kim', phone: '555-0314', email: 'nathan.k@email.com', skills: 'Vigil volunteer (11th hour)', availability: 'On-call', hoursLogged: 10.0, status: 'active', backgroundCheck: true, trainingCompleted: true },
      { name: 'Olivia Sanders', phone: '555-0315', email: 'olivia.s@email.com', skills: 'Children\'s grief support, education', availability: 'Sat mornings', hoursLogged: 8.0, status: 'active', backgroundCheck: true, trainingCompleted: false },
    ]);

    // Staff Schedules (15+)
    await Schedule.bulkCreate([
      { staffName: 'Emily Chen, RN', role: 'nurse', date: '2026-03-23', shiftType: 'day', startTime: '07:00', endTime: '15:00', status: 'scheduled' },
      { staffName: 'Jennifer Adams, RN', role: 'nurse', date: '2026-03-23', shiftType: 'evening', startTime: '15:00', endTime: '23:00', status: 'scheduled' },
      { staffName: 'Robert Kim, RN', role: 'nurse', date: '2026-03-23', shiftType: 'night', startTime: '23:00', endTime: '07:00', status: 'scheduled' },
      { staffName: 'Dr. James Wilson', role: 'physician', date: '2026-03-23', shiftType: 'day', startTime: '08:00', endTime: '17:00', status: 'scheduled' },
      { staffName: 'Dr. Patricia Brown', role: 'physician', date: '2026-03-23', shiftType: 'on-call', startTime: '17:00', endTime: '08:00', status: 'scheduled' },
      { staffName: 'Lisa Park, CNA', role: 'aide', date: '2026-03-23', shiftType: 'day', startTime: '07:00', endTime: '15:00', status: 'scheduled' },
      { staffName: 'Maria Rodriguez, LCSW', role: 'social_worker', date: '2026-03-23', shiftType: 'day', startTime: '08:30', endTime: '16:30', status: 'scheduled' },
      { staffName: 'Rev. David Thompson', role: 'chaplain', date: '2026-03-23', shiftType: 'day', startTime: '09:00', endTime: '17:00', status: 'scheduled' },
      { staffName: 'Angela Davis, MSW', role: 'social_worker', date: '2026-03-24', shiftType: 'day', startTime: '08:30', endTime: '16:30', status: 'scheduled' },
      { staffName: 'Emily Chen, RN', role: 'nurse', date: '2026-03-24', shiftType: 'on-call', startTime: '17:00', endTime: '07:00', status: 'scheduled' },
      { staffName: 'Jennifer Adams, RN', role: 'nurse', date: '2026-03-24', shiftType: 'day', startTime: '07:00', endTime: '15:00', status: 'scheduled' },
      { staffName: 'Robert Kim, RN', role: 'nurse', date: '2026-03-24', shiftType: 'evening', startTime: '15:00', endTime: '23:00', status: 'scheduled' },
      { staffName: 'Dr. Patricia Brown', role: 'physician', date: '2026-03-24', shiftType: 'day', startTime: '08:00', endTime: '17:00', status: 'scheduled' },
      { staffName: 'Sister Mary O\'Brien', role: 'chaplain', date: '2026-03-24', shiftType: 'day', startTime: '09:00', endTime: '17:00', status: 'scheduled' },
      { staffName: 'Lisa Park, CNA', role: 'aide', date: '2026-03-24', shiftType: 'day', startTime: '07:00', endTime: '15:00', status: 'scheduled' },
    ]);

    // Equipment (15+)
    await Equipment.bulkCreate([
      { patientId: 1, equipmentName: 'Hospital Bed (Full Electric)', category: 'Bed', vendor: 'MedEquip Solutions', orderDate: '2025-12-01', deliveryDate: '2025-12-03', status: 'delivered', notes: 'With pressure-reducing mattress' },
      { patientId: 1, equipmentName: 'Bedside Commode', category: 'Bathroom', vendor: 'MedEquip Solutions', orderDate: '2025-12-01', deliveryDate: '2025-12-03', status: 'delivered' },
      { patientId: 2, equipmentName: 'Hospital Bed (Full Electric)', category: 'Bed', vendor: 'MedEquip Solutions', orderDate: '2025-11-15', deliveryDate: '2025-11-17', status: 'delivered' },
      { patientId: 2, equipmentName: 'IV Pump', category: 'Infusion', vendor: 'InfuCare Medical', orderDate: '2026-01-10', deliveryDate: '2026-01-10', status: 'delivered', notes: 'For continuous pain management' },
      { patientId: 4, equipmentName: 'Oxygen Concentrator (5L)', category: 'Respiratory', vendor: 'BreathEasy Medical', orderDate: '2026-01-20', deliveryDate: '2026-01-21', status: 'delivered' },
      { patientId: 4, equipmentName: 'Portable Oxygen Tanks', category: 'Respiratory', vendor: 'BreathEasy Medical', orderDate: '2026-01-20', deliveryDate: '2026-01-21', status: 'delivered', notes: 'Set of 4 E-cylinders' },
      { patientId: 4, equipmentName: 'Nebulizer', category: 'Respiratory', vendor: 'BreathEasy Medical', orderDate: '2026-01-20', deliveryDate: '2026-01-22', status: 'delivered' },
      { patientId: 7, equipmentName: 'Hoyer Lift', category: 'Mobility', vendor: 'MedEquip Solutions', orderDate: '2026-02-15', deliveryDate: '2026-02-17', status: 'delivered' },
      { patientId: 7, equipmentName: 'Wheelchair', category: 'Mobility', vendor: 'MedEquip Solutions', orderDate: '2026-02-15', deliveryDate: '2026-02-17', status: 'delivered' },
      { patientId: 9, equipmentName: 'Communication Board', category: 'Communication', vendor: 'AssistTech Inc', orderDate: '2026-02-01', deliveryDate: '2026-02-05', status: 'delivered', notes: 'Eye-gaze compatible tablet' },
      { patientId: 9, equipmentName: 'BiPAP Machine', category: 'Respiratory', vendor: 'BreathEasy Medical', orderDate: '2026-01-15', deliveryDate: '2026-01-16', status: 'delivered' },
      { patientId: 3, equipmentName: 'Bed Rails', category: 'Safety', vendor: 'MedEquip Solutions', orderDate: '2026-01-10', deliveryDate: '2026-01-12', status: 'delivered' },
      { patientId: 13, equipmentName: 'Hospital Bed (Full Electric)', category: 'Bed', vendor: 'MedEquip Solutions', orderDate: '2025-11-01', deliveryDate: '2025-11-03', status: 'delivered' },
      { patientId: 12, equipmentName: 'Alternating Pressure Mattress', category: 'Bed', vendor: 'MedEquip Solutions', orderDate: '2026-03-12', deliveryDate: '2026-03-14', status: 'delivered' },
      { patientId: 15, equipmentName: 'Suction Machine', category: 'Respiratory', vendor: 'MedEquip Solutions', orderDate: '2026-02-10', deliveryDate: '2026-02-11', status: 'delivered', notes: 'For oral suctioning PRN' },
    ]);

    // Certifications (15+)
    await Certification.bulkCreate([
      { patientId: 1, benefitPeriod: 1, startDate: '2025-12-01', endDate: '2026-02-28', certifyingPhysician: 'Dr. James Wilson', f2fDate: '2025-11-28', f2fPhysician: 'Dr. James Wilson', status: 'expired' },
      { patientId: 1, benefitPeriod: 2, startDate: '2026-03-01', endDate: '2026-05-29', certifyingPhysician: 'Dr. James Wilson', f2fDate: '2026-02-25', f2fPhysician: 'Dr. James Wilson', status: 'active' },
      { patientId: 2, benefitPeriod: 1, startDate: '2025-11-15', endDate: '2026-02-12', certifyingPhysician: 'Dr. Patricia Brown', f2fDate: '2025-11-12', f2fPhysician: 'Dr. Patricia Brown', status: 'expired' },
      { patientId: 2, benefitPeriod: 2, startDate: '2026-02-13', endDate: '2026-05-13', certifyingPhysician: 'Dr. Patricia Brown', f2fDate: '2026-02-10', f2fPhysician: 'Dr. Patricia Brown', status: 'active' },
      { patientId: 3, benefitPeriod: 1, startDate: '2026-01-10', endDate: '2026-04-09', certifyingPhysician: 'Dr. James Wilson', f2fDate: '2026-01-08', f2fPhysician: 'Dr. James Wilson', status: 'active' },
      { patientId: 4, benefitPeriod: 1, startDate: '2026-01-20', endDate: '2026-04-19', certifyingPhysician: 'Dr. Patricia Brown', f2fDate: '2026-01-18', f2fPhysician: 'Dr. Patricia Brown', status: 'active' },
      { patientId: 5, benefitPeriod: 1, startDate: '2026-02-01', endDate: '2026-05-01', certifyingPhysician: 'Dr. James Wilson', f2fDate: '2026-01-29', f2fPhysician: 'Dr. James Wilson', status: 'active' },
      { patientId: 7, benefitPeriod: 1, startDate: '2026-02-15', endDate: '2026-05-15', certifyingPhysician: 'Dr. James Wilson', f2fDate: '2026-02-12', f2fPhysician: 'Dr. James Wilson', status: 'active' },
      { patientId: 8, benefitPeriod: 1, startDate: '2026-03-01', endDate: '2026-05-29', certifyingPhysician: 'Dr. Patricia Brown', f2fDate: '2026-02-28', f2fPhysician: 'Dr. Patricia Brown', status: 'active' },
      { patientId: 9, benefitPeriod: 1, startDate: '2026-01-05', endDate: '2026-04-04', certifyingPhysician: 'Dr. James Wilson', f2fDate: '2026-01-03', f2fPhysician: 'Dr. James Wilson', status: 'active' },
      { patientId: 10, benefitPeriod: 1, startDate: '2026-02-20', endDate: '2026-05-20', certifyingPhysician: 'Dr. Patricia Brown', f2fDate: '2026-02-18', f2fPhysician: 'Dr. Patricia Brown', status: 'active' },
      { patientId: 12, benefitPeriod: 1, startDate: '2026-03-10', endDate: '2026-06-07', certifyingPhysician: 'Dr. Patricia Brown', f2fDate: '2026-03-08', f2fPhysician: 'Dr. Patricia Brown', status: 'active' },
      { patientId: 13, benefitPeriod: 1, startDate: '2025-11-01', endDate: '2026-01-29', certifyingPhysician: 'Dr. James Wilson', f2fDate: '2025-10-28', f2fPhysician: 'Dr. James Wilson', status: 'expired' },
      { patientId: 13, benefitPeriod: 2, startDate: '2026-01-30', endDate: '2026-04-29', certifyingPhysician: 'Dr. James Wilson', f2fDate: '2026-01-27', f2fPhysician: 'Dr. James Wilson', status: 'active' },
      { patientId: 15, benefitPeriod: 1, startDate: '2026-02-10', endDate: '2026-05-10', certifyingPhysician: 'Dr. James Wilson', f2fDate: '2026-02-08', f2fPhysician: 'Dr. James Wilson', status: 'active' },
    ]);

    // Billing Records (15+)
    await Billing.bulkCreate([
      { patientId: 1, serviceDate: '2026-03-01', levelOfCare: 'routine', payerType: 'Medicare', claimAmount: 5478.00, paidAmount: 5478.00, claimStatus: 'paid', billingCode: '0651', notes: 'March routine home care' },
      { patientId: 2, serviceDate: '2026-03-01', levelOfCare: 'continuous', payerType: 'Medicare', claimAmount: 14892.00, paidAmount: 0, claimStatus: 'pending', billingCode: '0652', notes: 'March continuous care - crisis pain management' },
      { patientId: 3, serviceDate: '2026-03-01', levelOfCare: 'routine', payerType: 'Medicare', claimAmount: 5478.00, paidAmount: 5478.00, claimStatus: 'paid', billingCode: '0651' },
      { patientId: 4, serviceDate: '2026-03-01', levelOfCare: 'routine', payerType: 'Medicaid', claimAmount: 4850.00, paidAmount: 4200.00, claimStatus: 'partial', billingCode: '0651', notes: 'Medicaid rate adjustment' },
      { patientId: 5, serviceDate: '2026-03-01', levelOfCare: 'GIP', payerType: 'Medicare', claimAmount: 22890.00, paidAmount: 0, claimStatus: 'pending', billingCode: '0656', notes: 'GIP for uncontrolled symptoms' },
      { patientId: 6, serviceDate: '2026-03-01', levelOfCare: 'routine', payerType: 'Private', claimAmount: 6200.00, paidAmount: 6200.00, claimStatus: 'paid', billingCode: '0651' },
      { patientId: 7, serviceDate: '2026-03-01', levelOfCare: 'routine', payerType: 'Medicare', claimAmount: 5478.00, paidAmount: 5478.00, claimStatus: 'paid', billingCode: '0651' },
      { patientId: 8, serviceDate: '2026-03-01', levelOfCare: 'continuous', payerType: 'Medicare', claimAmount: 14892.00, paidAmount: 0, claimStatus: 'submitted', billingCode: '0652' },
      { patientId: 9, serviceDate: '2026-03-01', levelOfCare: 'routine', payerType: 'Medicare', claimAmount: 5478.00, paidAmount: 5478.00, claimStatus: 'paid', billingCode: '0651' },
      { patientId: 10, serviceDate: '2026-03-01', levelOfCare: 'routine', payerType: 'Medicare', claimAmount: 5478.00, paidAmount: 0, claimStatus: 'submitted', billingCode: '0651' },
      { patientId: 12, serviceDate: '2026-03-10', levelOfCare: 'routine', payerType: 'Medicaid', claimAmount: 4850.00, paidAmount: 0, claimStatus: 'pending', billingCode: '0651' },
      { patientId: 13, serviceDate: '2026-03-01', levelOfCare: 'respite', payerType: 'Medicare', claimAmount: 4575.00, paidAmount: 4575.00, claimStatus: 'paid', billingCode: '0655', notes: 'Respite care - caregiver relief' },
      { patientId: 14, serviceDate: '2026-03-01', levelOfCare: 'routine', payerType: 'Private', claimAmount: 6200.00, paidAmount: 0, claimStatus: 'submitted', billingCode: '0651' },
      { patientId: 15, serviceDate: '2026-03-01', levelOfCare: 'GIP', payerType: 'Medicare', claimAmount: 22890.00, paidAmount: 0, claimStatus: 'pending', billingCode: '0656', notes: 'GIP for seizure management' },
      { patientId: 1, serviceDate: '2026-02-01', levelOfCare: 'routine', payerType: 'Medicare', claimAmount: 5478.00, paidAmount: 5478.00, claimStatus: 'paid', billingCode: '0651', notes: 'February routine home care' },
    ]);

    // Quality Measures (15+)
    await QualityMeasure.bulkCreate([
      { measureType: 'HIS', measureName: 'Pain Screening', period: 'Q1 2026', score: 95.2, benchmark: 89.0, notes: 'Exceeding national benchmark' },
      { measureType: 'HIS', measureName: 'Pain Assessment', period: 'Q1 2026', score: 92.8, benchmark: 85.0 },
      { measureType: 'HIS', measureName: 'Dyspnea Screening', period: 'Q1 2026', score: 97.1, benchmark: 91.0 },
      { measureType: 'HIS', measureName: 'Dyspnea Treatment', period: 'Q1 2026', score: 88.5, benchmark: 82.0 },
      { measureType: 'HIS', measureName: 'Patients Treated with Opioid - Bowel Regimen', period: 'Q1 2026', score: 91.0, benchmark: 86.0 },
      { measureType: 'HIS', measureName: 'Beliefs/Values Addressed', period: 'Q1 2026', score: 94.5, benchmark: 88.0 },
      { measureType: 'CAHPS', measureName: 'Overall Rating of Care', period: 'Q4 2025', score: 82.0, benchmark: 78.5, notes: 'Family satisfaction survey results' },
      { measureType: 'CAHPS', measureName: 'Willingness to Recommend', period: 'Q4 2025', score: 85.3, benchmark: 80.0 },
      { measureType: 'CAHPS', measureName: 'Help for Pain and Symptoms', period: 'Q4 2025', score: 78.9, benchmark: 73.0, notes: 'Improvement from Q3' },
      { measureType: 'CAHPS', measureName: 'Communication with Family', period: 'Q4 2025', score: 80.5, benchmark: 76.0 },
      { measureType: 'CAHPS', measureName: 'Getting Timely Help', period: 'Q4 2025', score: 75.2, benchmark: 71.5, notes: 'Target area for improvement' },
      { measureType: 'CAHPS', measureName: 'Treating Patient with Respect', period: 'Q4 2025', score: 90.1, benchmark: 85.0 },
      { measureType: 'HIS', measureName: 'Visits in Last Days of Life', period: 'Q1 2026', score: 88.0, benchmark: 82.0, notes: 'RN or MD visit in last 3 days' },
      { measureType: 'HIS', measureName: 'SDS Score - Patient Safety', period: 'Q1 2026', score: 93.5, benchmark: 90.0 },
      { measureType: 'CAHPS', measureName: 'Emotional and Spiritual Support', period: 'Q4 2025', score: 83.7, benchmark: 79.0 },
    ]);

    // Spiritual Care (15+)
    await SpiritualCare.bulkCreate([
      { patientId: 1, chaplainName: 'Rev. David Thompson', visitDate: '2026-03-18T14:00:00', spiritualNeeds: 'Finding peace with end of life, concern about leaving family', religiousPreference: 'Baptist', ritualRequests: 'Weekly prayer, scripture reading', notes: 'Patient finding comfort in Psalms. Discussed legacy letters.', status: 'active' },
      { patientId: 2, chaplainName: 'Rev. David Thompson', visitDate: '2026-03-19T10:00:00', spiritualNeeds: 'Military service reconciliation, spiritual meaning in suffering', religiousPreference: 'Non-denominational', ritualRequests: 'Prayer', notes: 'Vietnam veteran. Working through moral injury.', status: 'active' },
      { patientId: 3, chaplainName: 'Sister Mary O\'Brien', visitDate: '2026-03-17T11:00:00', spiritualNeeds: 'Maintaining spiritual connection despite cognitive decline', religiousPreference: 'Methodist', ritualRequests: 'Hymn singing, familiar prayers', notes: 'Responds to hymns from childhood. Eyes brighten during singing.', status: 'active' },
      { patientId: 5, chaplainName: 'Rev. David Thompson', visitDate: '2026-03-21T15:00:00', spiritualNeeds: 'Sacramental care, last rites preparation', religiousPreference: 'Catholic', ritualRequests: 'Communion, confession, anointing of the sick', notes: 'Family requested priest for last rites when time comes.', status: 'active' },
      { patientId: 7, chaplainName: 'Sister Mary O\'Brien', visitDate: '2026-03-19T13:00:00', spiritualNeeds: 'Acceptance of declining function', religiousPreference: 'Episcopal', ritualRequests: 'Book of Common Prayer readings', notes: 'Finding meaning through faith community visits.', status: 'active' },
      { patientId: 8, chaplainName: 'Rev. David Thompson', visitDate: '2026-03-20T10:00:00', spiritualNeeds: 'Legacy and meaning-making', religiousPreference: 'Catholic', ritualRequests: 'Rosary, communion', notes: 'Wife joining in prayer sessions. Finding comfort together.', status: 'active' },
      { patientId: 9, chaplainName: 'Sister Mary O\'Brien', visitDate: '2026-03-18T14:00:00', spiritualNeeds: 'Communication of spiritual needs despite ALS', religiousPreference: 'Unitarian', ritualRequests: 'Meditation, nature sounds', notes: 'Using communication board for spiritual discussions.', status: 'active' },
      { patientId: 10, chaplainName: 'Rev. David Thompson', visitDate: '2026-03-21T11:00:00', spiritualNeeds: 'Peace with ICD deactivation decision', religiousPreference: 'Lutheran', ritualRequests: 'Weekly communion', notes: 'Struggling with feeling like "giving up" vs accepting God\'s plan.', status: 'active' },
      { patientId: 12, chaplainName: 'Sister Mary O\'Brien', visitDate: '2026-03-20T13:00:00', spiritualNeeds: 'Family reconciliation, unfinished business', religiousPreference: 'None specified', ritualRequests: 'Meditation', notes: 'Estranged from sister. Working on forgiveness.', status: 'active' },
      { patientId: 13, chaplainName: 'Rev. David Thompson', visitDate: '2026-03-19T15:00:00', spiritualNeeds: 'Pain as spiritual suffering, finding meaning', religiousPreference: 'Presbyterian', ritualRequests: 'Prayer, scripture', notes: 'Discussing theodicy. Finding comfort in community prayers.', status: 'active' },
      { patientId: 14, chaplainName: 'Rev. David Thompson', visitDate: '2026-03-20T14:00:00', spiritualNeeds: 'Worry about wife after death', religiousPreference: 'Jewish', ritualRequests: 'Rabbi visits, Shabbat prayers', notes: 'Coordinating with local rabbi for regular visits.', status: 'active' },
      { patientId: 15, chaplainName: 'Sister Mary O\'Brien', visitDate: '2026-03-22T10:00:00', spiritualNeeds: 'Making peace, completing legacy art', religiousPreference: 'Quaker', ritualRequests: 'Silent meditation, nature', notes: 'Patient painting watercolors as spiritual practice.', status: 'active' },
      { patientId: 4, chaplainName: 'Rev. David Thompson', visitDate: '2026-03-18T10:00:00', spiritualNeeds: 'Fear of suffocation, anxiety about breathing', religiousPreference: 'Baptist', ritualRequests: 'Prayer, psalm reading', notes: 'Breathing meditation combined with prayer helpful.', status: 'active' },
      { patientId: 6, chaplainName: 'Sister Mary O\'Brien', visitDate: '2026-03-17T14:00:00', spiritualNeeds: 'No specific religious needs identified', religiousPreference: 'Agnostic', ritualRequests: 'Reflective conversations', notes: 'Open to philosophical discussions about life meaning.', status: 'active' },
      { patientId: 1, chaplainName: 'Rev. David Thompson', visitDate: '2026-03-11T14:00:00', spiritualNeeds: 'Legacy letters to grandchildren', religiousPreference: 'Baptist', ritualRequests: 'Prayer', notes: 'Completed first legacy letter with chaplain support.', status: 'active' },
    ]);

    // Social Work Assessments (15+)
    await SocialWorkAssessment.bulkCreate([
      { patientId: 1, socialWorkerName: 'Maria Rodriguez, LCSW', assessmentDate: '2025-12-05', psychosocialNeeds: 'Anticipatory grief, caregiver stress for daughter', financialConcerns: 'Medicare coverage adequate. No financial distress.', communityResources: 'Referred to local support group, Meals on Wheels', familyDynamics: 'Close family. Son geographically distant, some guilt.', copingAssessment: 'Patient coping well. Daughter showing burnout signs.', goals: 'Support daughter caregiver, facilitate family communication', status: 'active' },
      { patientId: 2, socialWorkerName: 'Angela Davis, MSW', assessmentDate: '2025-11-20', psychosocialNeeds: 'Veteran with PTSD history, pain-related anxiety', financialConcerns: 'VA benefits active. Wife managing finances well.', communityResources: 'VA chaplain coordination, veteran support group', familyDynamics: 'Strong marriage. Wife is sole caregiver, burnout risk.', copingAssessment: 'Patient stoic, wife internalizing stress.', goals: 'Veteran-specific support, wife caregiver respite', status: 'active' },
      { patientId: 3, socialWorkerName: 'Maria Rodriguez, LCSW', assessmentDate: '2026-01-15', psychosocialNeeds: 'Ambiguous loss/grief for daughter due to dementia', financialConcerns: 'Long-term care insurance supplementing Medicare', communityResources: 'Alzheimer Association support group, respite referral', familyDynamics: 'Daughter sole caregiver. Siblings uninvolved.', copingAssessment: 'Daughter experiencing anticipatory grief and guilt.', goals: 'Sibling engagement, caregiver support for daughter', status: 'active' },
      { patientId: 4, socialWorkerName: 'Angela Davis, MSW', assessmentDate: '2026-01-25', psychosocialNeeds: 'Breathing anxiety, loss of independence', financialConcerns: 'Medicaid. Limited income. Needs assistance with bills.', communityResources: 'Low-income utility assistance, food bank referral', familyDynamics: 'Son is primary support. No other family nearby.', copingAssessment: 'Son managing well but needs respite.', goals: 'Financial assistance coordination, anxiety management', status: 'active' },
      { patientId: 5, socialWorkerName: 'Maria Rodriguez, LCSW', assessmentDate: '2026-02-05', psychosocialNeeds: 'Cultural/language needs, family decision-making support', financialConcerns: 'Medicare. Family pooling resources for additional care.', communityResources: 'Spanish-speaking counselor, cultural liaison', familyDynamics: 'Large extended family. Culturally, decisions made collectively.', copingAssessment: 'Family network is strong support. Language barrier with some staff.', goals: 'Bilingual support, cultural sensitivity in care', status: 'active' },
      { patientId: 7, socialWorkerName: 'Angela Davis, MSW', assessmentDate: '2026-02-20', psychosocialNeeds: 'Loss of mobility and speech, identity adjustment', financialConcerns: 'Medicare adequate. Daughter managing POA responsibilities well.', communityResources: 'Parkinson Foundation resources, adaptive equipment resources', familyDynamics: 'Healthcare worker daughter providing informed advocacy.', copingAssessment: 'Patient frustrated with declining function. Daughter coping clinically.', goals: 'Quality of life maintenance, communication strategies', status: 'active' },
      { patientId: 8, socialWorkerName: 'Angela Davis, MSW', assessmentDate: '2026-03-05', psychosocialNeeds: 'Wife anticipatory grief, young grandchildren coping', financialConcerns: 'Medicare. Some concerns about wife\'s financial future.', communityResources: 'Widow financial planning resource, children\'s grief program', familyDynamics: 'Close family. Young grandchildren asking questions about grandpa.', copingAssessment: 'Wife tearful, requesting individual counseling.', goals: 'Wife support, age-appropriate grandchildren preparation', status: 'active' },
      { patientId: 9, socialWorkerName: 'Maria Rodriguez, LCSW', assessmentDate: '2026-01-10', psychosocialNeeds: 'ALS-specific grief, communication challenges', financialConcerns: 'ALS Association grants, Medicare coverage', communityResources: 'ALS Association support, adaptive technology resources', familyDynamics: 'Husband deeply devoted. Helping with legacy project.', copingAssessment: 'Couple processing grief together through creative outlets.', goals: 'Communication support, legacy project facilitation', status: 'active' },
      { patientId: 10, socialWorkerName: 'Angela Davis, MSW', assessmentDate: '2026-02-25', psychosocialNeeds: 'Decision-related guilt about ICD deactivation', financialConcerns: 'Medicare. No financial concerns.', communityResources: 'Heart failure support group, ethics consult available', familyDynamics: 'Wife supportive of decision. Some extended family questioning.', copingAssessment: 'Both processing the decision. Need ongoing support.', goals: 'Decision validation support, family education', status: 'active' },
      { patientId: 12, socialWorkerName: 'Maria Rodriguez, LCSW', assessmentDate: '2026-03-15', psychosocialNeeds: 'Estrangement from family, limited support system', financialConcerns: 'Medicaid. Son needs help with funeral planning finances.', communityResources: 'Medicaid funeral assistance, community support programs', familyDynamics: 'Son is sole support. Estranged from sister and mother.', copingAssessment: 'Son overwhelmed with caregiving and Medicaid paperwork.', goals: 'Practical support for son, potential family reconciliation', status: 'active' },
      { patientId: 13, socialWorkerName: 'Angela Davis, MSW', assessmentDate: '2025-11-10', psychosocialNeeds: 'Pain-related depression, body image changes', financialConcerns: 'Medicare and supplemental insurance.', communityResources: 'Cancer support group, women\'s health resources', familyDynamics: 'Supportive family. Husband providing daily care.', copingAssessment: 'Grieving loss of health and role in family.', goals: 'Identity work, pain-related emotional support', status: 'active' },
      { patientId: 14, socialWorkerName: 'Maria Rodriguez, LCSW', assessmentDate: '2026-01-20', psychosocialNeeds: 'Worry about wife with depression history', financialConcerns: 'Private insurance. Financial planning referral made.', communityResources: 'Depression support, financial planning for surviving spouse', familyDynamics: 'Wife has history of MDD. Close monitoring needed.', copingAssessment: 'Patient more concerned about wife than self.', goals: 'Wife psychiatric support, financial planning', status: 'active' },
      { patientId: 15, socialWorkerName: 'Angela Davis, MSW', assessmentDate: '2026-02-15', psychosocialNeeds: 'Cognitive decline fear, legacy completion urgency', financialConcerns: 'Medicare. Family financially stable.', communityResources: 'Art therapy program, GBM support resources', familyDynamics: 'Large supportive family organizing vigil rotation.', copingAssessment: 'Finding peace through art. Urgent about completing paintings.', goals: 'Support legacy project completion, family vigil coordination', status: 'active' },
      { patientId: 6, socialWorkerName: 'Maria Rodriguez, LCSW', assessmentDate: '2025-10-20', psychosocialNeeds: 'No advance directive, needs goals of care conversation', financialConcerns: 'Private insurance. No financial concerns.', communityResources: 'Advance directive assistance, legal aid referral', familyDynamics: 'Family not fully engaged. Patient prefers independence.', copingAssessment: 'Patient in some denial about prognosis.', goals: 'Advance directive completion, family engagement', status: 'active' },
      { patientId: 4, socialWorkerName: 'Angela Davis, MSW', assessmentDate: '2026-03-15', psychosocialNeeds: 'Updated: Increasing anxiety about suffocation', financialConcerns: 'Applied for additional Medicaid benefits', communityResources: 'Anxiety management program, breathing support group', familyDynamics: 'Son requesting more respite support', copingAssessment: 'Patient anxiety worsening with disease progression.', goals: 'Anxiety management plan, son respite scheduling', status: 'active' },
    ]);

    // GIP Beds (15+)
    await GIPBed.bulkCreate([
      { facilityName: 'Springfield Hospice House', bedNumber: 'SHH-101', patientId: 5, admissionDate: '2026-03-18', reason: 'Uncontrolled nausea and vomiting, dehydration', status: 'occupied', notes: 'IV antiemetics and hydration' },
      { facilityName: 'Springfield Hospice House', bedNumber: 'SHH-102', patientId: 15, admissionDate: '2026-03-20', reason: 'Uncontrolled seizure activity requiring dose adjustments', status: 'occupied', notes: 'Continuous monitoring for seizures' },
      { facilityName: 'Springfield Hospice House', bedNumber: 'SHH-103', status: 'available', notes: 'Cleaned and ready' },
      { facilityName: 'Springfield Hospice House', bedNumber: 'SHH-104', status: 'available', notes: 'Cleaned and ready' },
      { facilityName: 'Springfield Hospice House', bedNumber: 'SHH-105', status: 'maintenance', notes: 'Bed rail replacement scheduled' },
      { facilityName: 'Memorial Hospital - Hospice Wing', bedNumber: 'MH-201', status: 'available', notes: 'Reserved for crisis admissions' },
      { facilityName: 'Memorial Hospital - Hospice Wing', bedNumber: 'MH-202', status: 'available' },
      { facilityName: 'Memorial Hospital - Hospice Wing', bedNumber: 'MH-203', status: 'available' },
      { facilityName: 'St. Mary\'s Inpatient Unit', bedNumber: 'SM-301', status: 'available', notes: 'Catholic facility, chapel access' },
      { facilityName: 'St. Mary\'s Inpatient Unit', bedNumber: 'SM-302', status: 'available' },
      { facilityName: 'St. Mary\'s Inpatient Unit', bedNumber: 'SM-303', status: 'reserved', notes: 'Reserved for patient Garcia if crisis develops' },
      { facilityName: 'Springfield Hospice House', bedNumber: 'SHH-106', status: 'available', notes: 'Private room, garden view' },
      { facilityName: 'Springfield Hospice House', bedNumber: 'SHH-107', status: 'available', notes: 'Family suite, pull-out couch' },
      { facilityName: 'Memorial Hospital - Hospice Wing', bedNumber: 'MH-204', status: 'cleaning', notes: 'Previous patient discharged 3/22' },
      { facilityName: 'Springfield Hospice House', bedNumber: 'SHH-108', status: 'available', notes: 'Bariatric bed available' },
    ]);

    // Supplies (15+)
    await Supply.bulkCreate([
      { itemName: 'Adult Briefs (Large)', category: 'Incontinence', quantity: 450, reorderLevel: 200, vendor: 'MedSupply Co', unitCost: 0.85, lastOrderDate: '2026-03-10', status: 'in_stock' },
      { itemName: 'Chux Pads (23x36)', category: 'Incontinence', quantity: 300, reorderLevel: 150, vendor: 'MedSupply Co', unitCost: 0.45, lastOrderDate: '2026-03-10', status: 'in_stock' },
      { itemName: 'Morphine Sulfate 20mg/ml (Emergency Kit)', category: 'Emergency Kit', quantity: 25, reorderLevel: 15, vendor: 'PharmaCare', unitCost: 12.50, lastOrderDate: '2026-03-15', status: 'in_stock' },
      { itemName: 'Lorazepam 2mg/ml Injectable (Emergency Kit)', category: 'Emergency Kit', quantity: 20, reorderLevel: 10, vendor: 'PharmaCare', unitCost: 8.75, lastOrderDate: '2026-03-15', status: 'in_stock' },
      { itemName: 'Atropine 1% Ophthalmic Drops (Emergency Kit)', category: 'Emergency Kit', quantity: 30, reorderLevel: 15, vendor: 'PharmaCare', unitCost: 15.00, lastOrderDate: '2026-03-15', status: 'in_stock' },
      { itemName: 'Haloperidol 5mg/ml (Emergency Kit)', category: 'Emergency Kit', quantity: 15, reorderLevel: 10, vendor: 'PharmaCare', unitCost: 6.50, lastOrderDate: '2026-03-15', status: 'in_stock' },
      { itemName: 'Wound Care Kit (Foam Dressings)', category: 'Wound Care', quantity: 80, reorderLevel: 40, vendor: 'WoundCare Plus', unitCost: 5.25, lastOrderDate: '2026-03-01', status: 'in_stock' },
      { itemName: 'Nitrile Gloves (Medium, Box/100)', category: 'PPE', quantity: 45, reorderLevel: 20, vendor: 'MedSupply Co', unitCost: 8.99, lastOrderDate: '2026-03-05', status: 'in_stock' },
      { itemName: 'Nitrile Gloves (Large, Box/100)', category: 'PPE', quantity: 38, reorderLevel: 20, vendor: 'MedSupply Co', unitCost: 8.99, lastOrderDate: '2026-03-05', status: 'in_stock' },
      { itemName: 'Catheter Kit (Foley, 16Fr)', category: 'Catheter', quantity: 12, reorderLevel: 10, vendor: 'MedSupply Co', unitCost: 18.50, lastOrderDate: '2026-02-20', status: 'low_stock' },
      { itemName: 'Suction Catheter Kit', category: 'Respiratory', quantity: 25, reorderLevel: 15, vendor: 'BreathEasy Medical', unitCost: 7.25, lastOrderDate: '2026-03-01', status: 'in_stock' },
      { itemName: 'Oral Care Kits', category: 'Comfort', quantity: 60, reorderLevel: 30, vendor: 'ComfortCare Supplies', unitCost: 3.50, lastOrderDate: '2026-03-10', status: 'in_stock' },
      { itemName: 'Barrier Cream (8oz)', category: 'Skin Care', quantity: 35, reorderLevel: 20, vendor: 'ComfortCare Supplies', unitCost: 6.75, lastOrderDate: '2026-03-01', status: 'in_stock' },
      { itemName: 'Syringe 10ml (Box/100)', category: 'Supplies', quantity: 8, reorderLevel: 10, vendor: 'MedSupply Co', unitCost: 12.00, lastOrderDate: '2026-02-15', status: 'low_stock' },
      { itemName: 'Oxygen Tubing (Nasal Cannula)', category: 'Respiratory', quantity: 40, reorderLevel: 20, vendor: 'BreathEasy Medical', unitCost: 2.25, lastOrderDate: '2026-03-05', status: 'in_stock' },
    ]);

    // Team Meetings (15+)
    await TeamMeeting.bulkCreate([
      { patientId: 1, meetingDate: '2026-03-20T13:00:00', attendees: 'Dr. Wilson, Emily Chen RN, Maria Rodriguez LCSW, Rev. Thompson, Lisa Park CNA', agenda: 'Care plan review, family meeting preparation, medication adjustments', discussion: 'Patient stable on current regimen. Daughter caregiver showing burnout. Discussed increasing aide visits. Spiritual needs being met.', decisions: 'Increase aide visits to daily. Schedule family meeting for 3/25. Continue current medications.', actionItems: 'Emily: Schedule family meeting. Maria: Caregiver burnout assessment for Susan. Lisa: Increase visits to daily.', status: 'completed' },
      { patientId: 2, meetingDate: '2026-03-21T13:00:00', attendees: 'Dr. Brown, Jennifer Adams RN, Angela Davis MSW, Rev. Thompson, Daniel Foster (Veteran Volunteer)', agenda: 'Pain crisis management, level of care assessment, veteran support', discussion: 'Pain crisis requiring continuous care level. Ketamine protocol discussed. Wife overwhelmed. Veteran-to-veteran volunteer providing emotional support.', decisions: 'Continue continuous care level. Add ketamine to pain protocol. Increase wife support.', actionItems: 'Jennifer: Implement ketamine protocol. Angela: Daily check-in with Carol. Daniel: Increase visits to 3x/week.', status: 'completed' },
      { patientId: 5, meetingDate: '2026-03-19T14:00:00', attendees: 'Dr. Wilson, Emily Chen RN, Maria Rodriguez LCSW, Rev. Thompson, Isabel Nguyen (Volunteer)', agenda: 'GIP admission review, symptom management, cultural considerations', discussion: 'GIP level warranted for uncontrolled symptoms. Spanish-language support essential. Family cultural needs being addressed.', decisions: 'Continue GIP. Request bilingual nurse coverage. Coordinate with Catholic priest for sacraments.', actionItems: 'Emily: Bilingual nurse scheduling. Rev. Thompson: Arrange priest visit. Maria: Cultural liaison coordination.', status: 'completed' },
      { patientId: 8, meetingDate: '2026-03-22T10:00:00', attendees: 'Dr. Brown, Jennifer Adams RN, Angela Davis MSW, Sister Mary O\'Brien', agenda: 'Disease progression, family support, anticipatory grief', discussion: 'Brain metastases causing increased symptoms. Wife needs additional support. Children\'s grief support needed.', decisions: 'Increase steroid dose. Refer wife to individual counseling. Start children\'s grief program.', actionItems: 'Dr. Brown: Adjust dexamethasone. Angela: Schedule wife counseling. Sister Mary: Coordinate children\'s grief support.', status: 'completed' },
      { patientId: 9, meetingDate: '2026-03-18T14:00:00', attendees: 'Dr. Wilson, Emily Chen RN, Maria Rodriguez LCSW, Sister Mary O\'Brien', agenda: 'Respiratory decline, communication needs, legacy project update', discussion: 'FVC declining. Communication board working well. Legacy photo album nearly complete. Discussed BiPAP vs comfort-only approach.', decisions: 'Continue BiPAP for now. Patient to decide when ready to transition. Prioritize legacy project completion.', actionItems: 'Emily: Monitor FVC weekly. Maria: Coordinate volunteer for legacy project. Claire (Vol): Continue companionship visits.', status: 'completed' },
      { patientId: 15, meetingDate: '2026-03-22T11:00:00', attendees: 'Dr. Wilson, Emily Chen RN, Angela Davis MSW, Sister Mary O\'Brien', agenda: 'GIP review, seizure management, legacy art project', discussion: 'Seizures increasing despite medication adjustment. Patient determined to finish paintings. Family vigil organized.', decisions: 'Increase Keppra. Continue dexamethasone. Support art therapy sessions around seizure risk.', actionItems: 'Dr. Wilson: Adjust anti-seizure meds. Emily: Seizure precautions education. Emma (Vol): Art therapy scheduling around energy peaks.', status: 'completed' },
      { meetingDate: '2026-03-23T08:00:00', attendees: 'All IDT members', agenda: 'Weekly census review, new admissions, discharges, deaths', discussion: 'Current census 14 active patients. 1 deceased (Frances Moore). 2 GIP patients. 2 continuous care. Discuss new referrals.', decisions: 'Accept 2 new referrals pending admission assessment. Review continuous care criteria for R. Williams.', actionItems: 'Admissions coordinator: Schedule assessment visits. Dr. Wilson: Continuous care recertification for Williams.', status: 'scheduled' },
      { patientId: 10, meetingDate: '2026-03-20T15:00:00', attendees: 'Dr. Brown, Robert Kim RN, Angela Davis MSW, Rev. Thompson', agenda: 'Post-ICD deactivation care, family coping, medication review', discussion: 'Patient adjusting post-deactivation. Some extended family members questioning decision. Need ethics support.', decisions: 'Offer ethics committee review for family members. Continue supportive care. Optimize heart failure symptoms.', actionItems: 'Angela: Arrange family meeting with ethics support. Robert: Diuretic optimization. Rev. Thompson: Spiritual support for decision.', status: 'completed' },
      { patientId: 4, meetingDate: '2026-03-19T11:00:00', attendees: 'Dr. Brown, Robert Kim RN, Angela Davis MSW, Rev. Thompson', agenda: 'Dyspnea management, anxiety, son caregiver support', discussion: 'Dyspnea worsening significantly. Anxiety about breathing increasing. Son needs respite.', decisions: 'Add low-dose morphine for dyspnea. Anxiety management protocol. Arrange respite care for son.', actionItems: 'Robert: Implement morphine protocol. Angela: Respite scheduling. Rev. Thompson: Breathing meditation sessions.', status: 'completed' },
      { patientId: 12, meetingDate: '2026-03-21T10:00:00', attendees: 'Dr. Brown, Robert Kim RN, Maria Rodriguez LCSW, Sister Mary O\'Brien', agenda: 'New admission review, pain management, family support', discussion: 'Recent admission with colon cancer. Pain increasing. Son sole caregiver needing Medicaid guidance. Estranged family dynamics.', decisions: 'Optimize opioid regimen. Social work to assist with Medicaid. Chaplain to explore family reconciliation gently.', actionItems: 'Robert: Pain reassessment daily. Maria: Medicaid paperwork assistance. Sister Mary: Explore reconciliation possibility.', status: 'completed' },
      { patientId: 14, meetingDate: '2026-03-20T14:00:00', attendees: 'Dr. Brown, Jennifer Adams RN, Maria Rodriguez LCSW, Rev. Thompson', agenda: 'Liver disease progression, wife depression monitoring, cultural needs', discussion: 'ESLD progressing. Jaundice worsening. Wife\'s depression concerning. Patient Jewish, requesting rabbi visits.', decisions: 'Monitor closely for hepatic encephalopathy. Psychiatric referral for wife. Coordinate with local rabbi.', actionItems: 'Jennifer: Daily assessment. Maria: Wife psychiatric referral. Rev. Thompson: Rabbi coordination.', status: 'completed' },
      { patientId: 13, meetingDate: '2026-03-18T10:00:00', attendees: 'Dr. Wilson, Emily Chen RN, Angela Davis MSW', agenda: 'Respite care review, pain management, caregiver support', discussion: 'Currently in respite care. Husband getting much-needed rest. Bone pain being addressed.', decisions: 'Continue respite through 3/25. Adjust pain medication. Schedule husband follow-up.', actionItems: 'Emily: Pain medication adjustment. Angela: Husband check-in post-respite.', status: 'completed' },
      { patientId: 3, meetingDate: '2026-03-17T13:00:00', attendees: 'Dr. Wilson, Emily Chen RN, Maria Rodriguez LCSW, Lisa Park CNA, Sister Mary O\'Brien', agenda: 'Dementia care, daughter support, aide care plan review', discussion: 'Patient comfort focused. Occasional recognition of daughter providing brief moments of connection. Aide plan effective.', decisions: 'Continue current care plan. Add music therapy. Support daughter with ambiguous grief resources.', actionItems: 'Lisa: Add music to care routine. Maria: Ambiguous grief resources. Bob (Vol): Pet therapy continuation.', status: 'completed' },
      { patientId: 7, meetingDate: '2026-03-18T15:00:00', attendees: 'Dr. Wilson, Emily Chen RN, Angela Davis MSW, Sister Mary O\'Brien', agenda: 'Parkinson\'s decline, swallowing assessment, mobility', discussion: 'Swallowing deteriorating rapidly. Fall risk increasing. Patient frustrated but spiritually at peace.', decisions: 'Speech therapy consult. Modify diet to pureed. Increase mobility safety measures.', actionItems: 'Emily: Speech therapy referral. Angela: Quality of life discussion with patient and daughter.', status: 'completed' },
      { meetingDate: '2026-03-16T08:00:00', attendees: 'All IDT members', agenda: 'Weekly census review, quality measures review, regulatory updates', discussion: 'Census stable. Q1 quality measures exceeding benchmarks. CMS update on documentation requirements reviewed.', decisions: 'Implement new CMS documentation template. Plan for CAHPS improvement in timeliness area.', actionItems: 'QA team: New template rollout. All clinicians: Review documentation standards.', status: 'completed' },
    ]);

    // Compliance Documents (15+)
    await ComplianceDoc.bulkCreate([
      { documentType: 'Certification', title: 'Initial Certification - Margaret Johnson', patientId: 1, dueDate: '2025-12-01', completedDate: '2025-11-30', status: 'completed', assignedTo: 'Dr. James Wilson' },
      { documentType: 'Recertification', title: 'Recertification - Margaret Johnson (2nd Benefit Period)', patientId: 1, dueDate: '2026-03-01', completedDate: '2026-02-28', status: 'completed', assignedTo: 'Dr. James Wilson' },
      { documentType: 'F2F', title: 'Face-to-Face Encounter - Robert Williams', patientId: 2, dueDate: '2026-02-12', completedDate: '2026-02-10', status: 'completed', assignedTo: 'Dr. Patricia Brown' },
      { documentType: 'Care Plan', title: 'Comprehensive Care Plan Update - Dorothy Davis', patientId: 3, dueDate: '2026-04-10', status: 'pending', assignedTo: 'Emily Chen, RN' },
      { documentType: 'Election', title: 'Medicare Hospice Benefit Election - George Jackson', patientId: 12, dueDate: '2026-03-10', completedDate: '2026-03-10', status: 'completed', assignedTo: 'Karen White' },
      { documentType: 'Revocation', title: 'Revocation Rights Notice - All Active Patients', dueDate: '2026-03-31', status: 'pending', assignedTo: 'Karen White', content: 'Annual revocation rights notification for all patients' },
      { documentType: 'QAPI', title: 'Q1 2026 QAPI Report', dueDate: '2026-04-15', status: 'pending', assignedTo: 'Michael Torres', content: 'Quarterly quality assessment and performance improvement report' },
      { documentType: 'Survey Prep', title: 'State Survey Readiness Assessment', dueDate: '2026-04-01', status: 'in_progress', assignedTo: 'Dr. Helen Foster', content: 'Preparation for potential state survey inspection' },
      { documentType: 'F2F', title: 'Face-to-Face Encounter - Barbara Brown (Due)', patientId: 9, dueDate: '2026-04-04', status: 'pending', assignedTo: 'Dr. James Wilson' },
      { documentType: 'Policy', title: 'Emergency Preparedness Plan Update', dueDate: '2026-03-31', status: 'in_progress', assignedTo: 'Dr. Helen Foster' },
      { documentType: 'Training', title: 'Annual Competency Assessment - All Staff', dueDate: '2026-04-30', status: 'pending', assignedTo: 'Dr. Sarah Mitchell' },
      { documentType: 'Audit', title: 'Medical Record Audit - Q1 2026', dueDate: '2026-04-15', status: 'pending', assignedTo: 'Michael Torres' },
      { documentType: 'Certification', title: 'Initial Certification - George Jackson', patientId: 12, dueDate: '2026-03-10', completedDate: '2026-03-10', status: 'completed', assignedTo: 'Dr. Patricia Brown' },
      { documentType: 'Incident', title: 'Incident Report - Patient Fall (Patricia Thomas)', patientId: 7, dueDate: '2026-03-20', completedDate: '2026-03-20', status: 'completed', assignedTo: 'Emily Chen, RN', content: 'Minor fall from wheelchair. No injury. Prevention measures updated.' },
      { documentType: 'F2F', title: 'Face-to-Face Encounter - Ruth White (2nd Period)', patientId: 13, dueDate: '2026-04-29', status: 'pending', assignedTo: 'Dr. James Wilson' },
    ]);

    // Surveys (15+)
    await Survey.bulkCreate([
      { patientId: 1, respondentName: 'Susan Johnson', relationship: 'Daughter', surveyDate: '2026-03-15', overallRating: 9, painManagement: 8, communication: 9, emotionalSupport: 9, teamResponsiveness: 8, comments: 'The team has been wonderful. Nurse Emily is especially caring and thorough.', status: 'completed' },
      { patientId: 2, respondentName: 'Carol Williams', relationship: 'Wife', surveyDate: '2026-03-10', overallRating: 8, painManagement: 7, communication: 9, emotionalSupport: 8, teamResponsiveness: 9, comments: 'Pain management could be better but communication is excellent. Dr. Brown always explains everything.', status: 'completed' },
      { patientId: 3, respondentName: 'Linda Davis-Smith', relationship: 'Daughter', surveyDate: '2026-03-12', overallRating: 9, painManagement: 9, communication: 8, emotionalSupport: 10, teamResponsiveness: 9, comments: 'The aide Lisa is amazing with mom. The pet therapy volunteer brings so much joy.', status: 'completed' },
      { patientId: 4, respondentName: 'Thomas Anderson', relationship: 'Son', surveyDate: '2026-03-08', overallRating: 8, painManagement: 8, communication: 8, emotionalSupport: 7, teamResponsiveness: 7, comments: 'Wish the on-call nurse could respond a little faster on weekends.', status: 'completed' },
      { patientId: 5, respondentName: 'Maria Martinez-Lopez', relationship: 'Daughter', surveyDate: '2026-03-20', overallRating: 8, painManagement: 8, communication: 7, emotionalSupport: 9, teamResponsiveness: 8, comments: 'The Spanish-speaking volunteer is wonderful. Would appreciate more bilingual staff.', status: 'completed' },
      { patientId: 7, respondentName: 'Katherine Thomas', relationship: 'Daughter', surveyDate: '2026-03-14', overallRating: 9, painManagement: 9, communication: 10, emotionalSupport: 9, teamResponsiveness: 9, comments: 'As a healthcare worker myself, I appreciate the high level of professionalism.', status: 'completed' },
      { patientId: 8, respondentName: 'Elena Garcia', relationship: 'Wife', surveyDate: '2026-03-18', overallRating: 9, painManagement: 8, communication: 9, emotionalSupport: 10, teamResponsiveness: 9, comments: 'Angela the social worker has been a lifesaver for me and the grandchildren.', status: 'completed' },
      { patientId: 9, respondentName: 'Mark Brown', relationship: 'Husband', surveyDate: '2026-03-16', overallRating: 10, painManagement: 9, communication: 10, emotionalSupport: 10, teamResponsiveness: 10, comments: 'The team treats Barbara with such dignity. The legacy project support means the world to us.', status: 'completed' },
      { patientId: 10, respondentName: 'Sarah Wilson', relationship: 'Wife', surveyDate: '2026-03-19', overallRating: 8, painManagement: 8, communication: 9, emotionalSupport: 8, teamResponsiveness: 8, comments: 'Grateful for the ethics support around the ICD decision. Team handled it sensitively.', status: 'completed' },
      { patientId: 11, respondentName: 'Patricia Moore-Bell', relationship: 'Daughter', surveyDate: '2026-01-15', overallRating: 9, painManagement: 9, communication: 9, emotionalSupport: 9, teamResponsiveness: 9, comments: 'Mom passed peacefully. The bereavement program has been so helpful.', status: 'completed' },
      { patientId: 12, respondentName: 'Robert Jackson Jr', relationship: 'Son', surveyDate: '2026-03-22', overallRating: 7, painManagement: 7, communication: 8, emotionalSupport: 7, teamResponsiveness: 7, comments: 'Still getting settled. The Medicaid paperwork help has been really valuable.', status: 'completed' },
      { patientId: 13, respondentName: 'James White', relationship: 'Husband', surveyDate: '2026-03-11', overallRating: 8, painManagement: 7, communication: 8, emotionalSupport: 8, teamResponsiveness: 8, comments: 'Respite care gave me the break I needed. Thank you.', status: 'completed' },
      { patientId: 14, respondentName: 'Catherine Harris', relationship: 'Wife', surveyDate: '2026-03-17', overallRating: 8, painManagement: 8, communication: 9, emotionalSupport: 9, teamResponsiveness: 8, comments: 'Thank you for the psychiatric referral. It is helping me cope.', status: 'completed' },
      { patientId: 15, respondentName: 'James Clark Jr', relationship: 'Son', surveyDate: '2026-03-21', overallRating: 9, painManagement: 8, communication: 9, emotionalSupport: 9, teamResponsiveness: 9, comments: 'The art therapy volunteer Emma is incredible. Mom lights up during their sessions.', status: 'completed' },
      { patientId: 6, respondentName: 'Nancy Taylor', relationship: 'Daughter', surveyDate: '2026-03-13', overallRating: 7, painManagement: 7, communication: 7, emotionalSupport: 6, teamResponsiveness: 7, comments: 'Dad is resistant to help but the team is patient. Could use more spiritual support even though he says he doesn\'t want it.', status: 'completed' },
    ]);

    console.log('Seed data inserted successfully!');
    console.log('Demo login users provisioned from the local environment.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
