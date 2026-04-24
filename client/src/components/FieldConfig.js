const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'completed', label: 'Completed' },
  { value: 'deceased', label: 'Deceased' },
];

const LOC_OPTIONS = [
  { value: 'routine', label: 'Routine' },
  { value: 'continuous', label: 'Continuous Care' },
  { value: 'respite', label: 'Respite' },
  { value: 'GIP', label: 'General Inpatient (GIP)' },
];

const INSURANCE_OPTIONS = [
  { value: 'Medicare', label: 'Medicare' },
  { value: 'Medicaid', label: 'Medicaid' },
  { value: 'Private', label: 'Private Insurance' },
];

export function getColumns(featureKey) {
  const configs = {
    'patients': [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'diagnosis', label: 'Diagnosis', render: v => v ? (v.length > 40 ? v.substring(0, 40) + '...' : v) : '' },
      { key: 'levelOfCare', label: 'Level of Care', badge: true },
      { key: 'status', label: 'Status', badge: true },
      { key: 'primaryPhysician', label: 'Physician' },
    ],
    'care-plans': [
      { key: 'patientId', label: 'Patient ID' },
      { key: 'type', label: 'Type', badge: true },
      { key: 'goals', label: 'Goals', render: v => v ? (v.length > 50 ? v.substring(0, 50) + '...' : v) : '' },
      { key: 'frequency', label: 'Frequency' },
      { key: 'status', label: 'Status', badge: true },
      { key: 'createdBy', label: 'Created By' },
    ],
    'visits': [
      { key: 'patientId', label: 'Patient ID' },
      { key: 'visitDate', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '' },
      { key: 'visitType', label: 'Type', badge: true },
      { key: 'clinicianName', label: 'Clinician' },
      { key: 'clinicianRole', label: 'Role' },
      { key: 'status', label: 'Status', badge: true },
    ],
    'medications': [
      { key: 'patientId', label: 'Patient ID' },
      { key: 'name', label: 'Medication' },
      { key: 'dosage', label: 'Dosage' },
      { key: 'route', label: 'Route' },
      { key: 'frequency', label: 'Frequency' },
      { key: 'purpose', label: 'Purpose' },
      { key: 'status', label: 'Status', badge: true },
    ],
    'symptoms': [
      { key: 'patientId', label: 'Patient ID' },
      { key: 'date', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '' },
      { key: 'painLevel', label: 'Pain', render: v => `${v}/10` },
      { key: 'nauseaLevel', label: 'Nausea', render: v => `${v}/10` },
      { key: 'anxietyLevel', label: 'Anxiety', render: v => `${v}/10` },
      { key: 'dyspneaLevel', label: 'Dyspnea', render: v => `${v}/10` },
      { key: 'recordedBy', label: 'Recorded By' },
    ],
    'family-members': [
      { key: 'patientId', label: 'Patient ID' },
      { key: 'name', label: 'Name' },
      { key: 'relationship', label: 'Relationship' },
      { key: 'phone', label: 'Phone' },
      { key: 'isPrimaryCaregiver', label: 'Primary CG', render: v => v ? 'Yes' : 'No' },
      { key: 'bereavementRisk', label: 'Risk', badge: true },
    ],
    'bereavement': [
      { key: 'patientId', label: 'Patient ID' },
      { key: 'contactName', label: 'Contact' },
      { key: 'riskLevel', label: 'Risk', badge: true },
      { key: 'monthsCompleted', label: 'Months', render: v => `${v}/13` },
      { key: 'lastContactDate', label: 'Last Contact', render: v => v ? new Date(v).toLocaleDateString() : '' },
      { key: 'status', label: 'Status', badge: true },
    ],
    'spiritual-care': [
      { key: 'patientId', label: 'Patient ID' },
      { key: 'chaplainName', label: 'Chaplain' },
      { key: 'visitDate', label: 'Visit Date', render: v => v ? new Date(v).toLocaleDateString() : '' },
      { key: 'religiousPreference', label: 'Religion' },
      { key: 'status', label: 'Status', badge: true },
    ],
    'social-work': [
      { key: 'patientId', label: 'Patient ID' },
      { key: 'socialWorkerName', label: 'Social Worker' },
      { key: 'assessmentDate', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '' },
      { key: 'psychosocialNeeds', label: 'Needs', render: v => v ? (v.length > 40 ? v.substring(0, 40) + '...' : v) : '' },
      { key: 'status', label: 'Status', badge: true },
    ],
    'volunteers': [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'skills', label: 'Skills', render: v => v ? (v.length > 30 ? v.substring(0, 30) + '...' : v) : '' },
      { key: 'availability', label: 'Availability' },
      { key: 'hoursLogged', label: 'Hours' },
      { key: 'status', label: 'Status', badge: true },
    ],
    'schedules': [
      { key: 'staffName', label: 'Staff' },
      { key: 'role', label: 'Role' },
      { key: 'date', label: 'Date' },
      { key: 'shiftType', label: 'Shift', badge: true },
      { key: 'startTime', label: 'Start' },
      { key: 'endTime', label: 'End' },
      { key: 'status', label: 'Status', badge: true },
    ],
    'equipment': [
      { key: 'patientId', label: 'Patient ID' },
      { key: 'equipmentName', label: 'Equipment' },
      { key: 'category', label: 'Category' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'status', label: 'Status', badge: true },
    ],
    'supplies': [
      { key: 'itemName', label: 'Item' },
      { key: 'category', label: 'Category' },
      { key: 'quantity', label: 'Qty' },
      { key: 'reorderLevel', label: 'Reorder At' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'status', label: 'Status', badge: true },
    ],
    'gip-beds': [
      { key: 'facilityName', label: 'Facility' },
      { key: 'bedNumber', label: 'Bed #' },
      { key: 'patientId', label: 'Patient ID', render: v => v || '—' },
      { key: 'status', label: 'Status', badge: true },
    ],
    'certifications': [
      { key: 'patientId', label: 'Patient ID' },
      { key: 'benefitPeriod', label: 'Period' },
      { key: 'startDate', label: 'Start' },
      { key: 'endDate', label: 'End' },
      { key: 'certifyingPhysician', label: 'Physician' },
      { key: 'status', label: 'Status', badge: true },
    ],
    'billing': [
      { key: 'patientId', label: 'Patient ID' },
      { key: 'serviceDate', label: 'Service Date' },
      { key: 'levelOfCare', label: 'LOC', badge: true },
      { key: 'payerType', label: 'Payer' },
      { key: 'claimAmount', label: 'Claim $', render: v => `$${(v||0).toLocaleString()}` },
      { key: 'claimStatus', label: 'Status', badge: true },
    ],
    'quality-measures': [
      { key: 'measureType', label: 'Type', badge: true },
      { key: 'measureName', label: 'Measure' },
      { key: 'period', label: 'Period' },
      { key: 'score', label: 'Score', render: v => `${v}%` },
      { key: 'benchmark', label: 'Benchmark', render: v => `${v}%` },
    ],
    'compliance': [
      { key: 'documentType', label: 'Type' },
      { key: 'title', label: 'Title', render: v => v ? (v.length > 40 ? v.substring(0, 40) + '...' : v) : '' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'status', label: 'Status', badge: true },
      { key: 'assignedTo', label: 'Assigned To' },
    ],
    'team-meetings': [
      { key: 'meetingDate', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '' },
      { key: 'patientId', label: 'Patient ID', render: v => v || 'Census' },
      { key: 'attendees', label: 'Attendees', render: v => v ? (v.length > 40 ? v.substring(0, 40) + '...' : v) : '' },
      { key: 'status', label: 'Status', badge: true },
    ],
    'surveys': [
      { key: 'patientId', label: 'Patient ID' },
      { key: 'respondentName', label: 'Respondent' },
      { key: 'relationship', label: 'Relationship' },
      { key: 'overallRating', label: 'Rating', render: v => `${v}/10` },
      { key: 'surveyDate', label: 'Date' },
      { key: 'status', label: 'Status', badge: true },
    ],
  };
  return configs[featureKey] || [];
}

export function getFormFields(featureKey) {
  const configs = {
    'patients': [
      { key: 'firstName', label: 'First Name', required: true },
      { key: 'lastName', label: 'Last Name', required: true },
      { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
      { key: 'gender', label: 'Gender', type: 'select', options: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }] },
      { key: 'admissionDate', label: 'Admission Date', type: 'date' },
      { key: 'primaryPhysician', label: 'Primary Physician' },
      { key: 'diagnosis', label: 'Diagnosis', type: 'textarea', fullWidth: true },
      { key: 'prognosis', label: 'Prognosis', type: 'select', options: [{ value: '6 months or less', label: '6 months or less' }, { value: '3 months or less', label: '3 months or less' }, { value: '1 month or less', label: '1 month or less' }] },
      { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, badge: true },
      { key: 'levelOfCare', label: 'Level of Care', type: 'select', options: LOC_OPTIONS, badge: true },
      { key: 'address', label: 'Address', type: 'textarea', fullWidth: true },
      { key: 'phone', label: 'Phone' },
      { key: 'insuranceType', label: 'Insurance', type: 'select', options: INSURANCE_OPTIONS },
      { key: 'advanceDirective', label: 'Advance Directive', type: 'checkbox', checkLabel: 'On file' },
      { key: 'dnrStatus', label: 'DNR Status', type: 'checkbox', checkLabel: 'DNR on file' },
      { key: 'funeralPreferences', label: 'Funeral Preferences', type: 'textarea', fullWidth: true },
      { key: 'legacyProject', label: 'Legacy Project', type: 'textarea', fullWidth: true },
    ],
    'care-plans': [
      { key: 'patientId', label: 'Patient ID', type: 'number', required: true },
      { key: 'type', label: 'Type', type: 'select', required: true, options: [
        { value: 'physician', label: 'Physician' }, { value: 'nurse', label: 'Nurse' },
        { value: 'social_worker', label: 'Social Worker' }, { value: 'chaplain', label: 'Chaplain' },
        { value: 'aide', label: 'Aide' }
      ]},
      { key: 'goals', label: 'Goals', type: 'textarea', fullWidth: true, required: true },
      { key: 'interventions', label: 'Interventions', type: 'textarea', fullWidth: true },
      { key: 'frequency', label: 'Frequency' },
      { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, badge: true },
      { key: 'createdBy', label: 'Created By' },
      { key: 'nextReviewDate', label: 'Next Review', type: 'date' },
    ],
    'visits': [
      { key: 'patientId', label: 'Patient ID', type: 'number', required: true },
      { key: 'visitDate', label: 'Visit Date/Time', type: 'datetime-local' },
      { key: 'visitType', label: 'Visit Type', type: 'select', options: [
        { value: 'routine', label: 'Routine' }, { value: 'prn', label: 'PRN' },
        { value: 'admission', label: 'Admission' }, { value: 'discharge', label: 'Discharge' },
        { value: 'death', label: 'Death Visit' }
      ]},
      { key: 'clinicianName', label: 'Clinician Name' },
      { key: 'clinicianRole', label: 'Role', type: 'select', options: [
        { value: 'nurse', label: 'Nurse' }, { value: 'physician', label: 'Physician' },
        { value: 'social_worker', label: 'Social Worker' }, { value: 'chaplain', label: 'Chaplain' },
        { value: 'aide', label: 'Aide' }
      ]},
      { key: 'duration', label: 'Duration (min)', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: 'scheduled', label: 'Scheduled' }, { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }, { value: 'missed', label: 'Missed' }
      ], badge: true },
    ],
    'medications': [
      { key: 'patientId', label: 'Patient ID', type: 'number', required: true },
      { key: 'name', label: 'Medication Name', required: true },
      { key: 'dosage', label: 'Dosage' },
      { key: 'route', label: 'Route', type: 'select', options: [
        { value: 'oral', label: 'Oral' }, { value: 'sublingual', label: 'Sublingual' },
        { value: 'transdermal', label: 'Transdermal' }, { value: 'IV', label: 'IV' },
        { value: 'IM', label: 'IM' }, { value: 'subcutaneous', label: 'Subcutaneous' },
        { value: 'rectal', label: 'Rectal' }, { value: 'nebulizer', label: 'Nebulizer' },
        { value: 'topical', label: 'Topical' }
      ]},
      { key: 'frequency', label: 'Frequency' },
      { key: 'purpose', label: 'Purpose', type: 'select', options: [
        { value: 'pain', label: 'Pain' }, { value: 'anxiety', label: 'Anxiety' },
        { value: 'nausea', label: 'Nausea' }, { value: 'dyspnea', label: 'Dyspnea' },
        { value: 'comfort', label: 'General Comfort' }
      ]},
      { key: 'isComfortMed', label: 'Comfort Medication', type: 'checkbox' },
      { key: 'isEmergencyKit', label: 'Emergency Kit', type: 'checkbox' },
      { key: 'startDate', label: 'Start Date', type: 'date' },
      { key: 'endDate', label: 'End Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: 'active', label: 'Active' }, { value: 'discontinued', label: 'Discontinued' },
        { value: 'on_hold', label: 'On Hold' }
      ], badge: true },
    ],
    'symptoms': [
      { key: 'patientId', label: 'Patient ID', type: 'number', required: true },
      { key: 'date', label: 'Date/Time', type: 'datetime-local' },
      { key: 'painLevel', label: 'Pain Level (0-10)', type: 'number', min: 0, max: 10 },
      { key: 'nauseaLevel', label: 'Nausea Level (0-10)', type: 'number', min: 0, max: 10 },
      { key: 'anxietyLevel', label: 'Anxiety Level (0-10)', type: 'number', min: 0, max: 10 },
      { key: 'dyspneaLevel', label: 'Dyspnea Level (0-10)', type: 'number', min: 0, max: 10 },
      { key: 'fatigueLevel', label: 'Fatigue Level (0-10)', type: 'number', min: 0, max: 10 },
      { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
      { key: 'recordedBy', label: 'Recorded By' },
    ],
    'family-members': [
      { key: 'patientId', label: 'Patient ID', type: 'number', required: true },
      { key: 'name', label: 'Name', required: true },
      { key: 'relationship', label: 'Relationship' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'isPrimaryCaregiver', label: 'Primary Caregiver', type: 'checkbox' },
      { key: 'isPOA', label: 'Power of Attorney', type: 'checkbox' },
      { key: 'bereavementRisk', label: 'Bereavement Risk', type: 'select', badge: true, options: [
        { value: 'normal', label: 'Normal' }, { value: 'high', label: 'High' }, { value: 'complicated', label: 'Complicated' }
      ]},
      { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
    ],
    'bereavement': [
      { key: 'patientId', label: 'Patient ID', type: 'number', required: true },
      { key: 'familyMemberId', label: 'Family Member ID', type: 'number' },
      { key: 'contactName', label: 'Contact Name', required: true },
      { key: 'riskLevel', label: 'Risk Level', type: 'select', badge: true, options: [
        { value: 'normal', label: 'Normal' }, { value: 'high', label: 'High' }, { value: 'complicated', label: 'Complicated' }
      ]},
      { key: 'startDate', label: 'Start Date', type: 'date' },
      { key: 'endDate', label: 'End Date', type: 'date' },
      { key: 'lastContactDate', label: 'Last Contact', type: 'date' },
      { key: 'monthsCompleted', label: 'Months Completed', type: 'number', min: 0, max: 13 },
      { key: 'contactMethod', label: 'Contact Method', type: 'select', options: [
        { value: 'Phone call', label: 'Phone Call' }, { value: 'In-person', label: 'In Person' },
        { value: 'Card mailed', label: 'Card Mailed' }, { value: 'Email', label: 'Email' },
        { value: 'Age-appropriate materials mailed', label: 'Age-appropriate Materials' }
      ]},
      { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
      { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, badge: true },
    ],
    'spiritual-care': [
      { key: 'patientId', label: 'Patient ID', type: 'number', required: true },
      { key: 'chaplainName', label: 'Chaplain Name' },
      { key: 'visitDate', label: 'Visit Date', type: 'datetime-local' },
      { key: 'religiousPreference', label: 'Religious Preference' },
      { key: 'spiritualNeeds', label: 'Spiritual Needs', type: 'textarea', fullWidth: true },
      { key: 'ritualRequests', label: 'Ritual Requests', type: 'textarea', fullWidth: true },
      { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
      { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, badge: true },
    ],
    'social-work': [
      { key: 'patientId', label: 'Patient ID', type: 'number', required: true },
      { key: 'socialWorkerName', label: 'Social Worker' },
      { key: 'assessmentDate', label: 'Assessment Date', type: 'date' },
      { key: 'psychosocialNeeds', label: 'Psychosocial Needs', type: 'textarea', fullWidth: true },
      { key: 'financialConcerns', label: 'Financial Concerns', type: 'textarea', fullWidth: true },
      { key: 'communityResources', label: 'Community Resources', type: 'textarea', fullWidth: true },
      { key: 'familyDynamics', label: 'Family Dynamics', type: 'textarea', fullWidth: true },
      { key: 'copingAssessment', label: 'Coping Assessment', type: 'textarea', fullWidth: true },
      { key: 'goals', label: 'Goals', type: 'textarea', fullWidth: true },
      { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, badge: true },
    ],
    'volunteers': [
      { key: 'name', label: 'Name', required: true },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'skills', label: 'Skills', type: 'textarea', fullWidth: true },
      { key: 'availability', label: 'Availability' },
      { key: 'assignedPatientId', label: 'Assigned Patient ID', type: 'number' },
      { key: 'hoursLogged', label: 'Hours Logged', type: 'number', step: '0.5' },
      { key: 'backgroundCheck', label: 'Background Check', type: 'checkbox' },
      { key: 'trainingCompleted', label: 'Training Completed', type: 'checkbox' },
      { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, badge: true },
    ],
    'schedules': [
      { key: 'staffName', label: 'Staff Name', required: true },
      { key: 'role', label: 'Role', type: 'select', options: [
        { value: 'nurse', label: 'Nurse' }, { value: 'physician', label: 'Physician' },
        { value: 'social_worker', label: 'Social Worker' }, { value: 'chaplain', label: 'Chaplain' },
        { value: 'aide', label: 'Aide' }
      ]},
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'shiftType', label: 'Shift Type', type: 'select', options: [
        { value: 'day', label: 'Day' }, { value: 'evening', label: 'Evening' },
        { value: 'night', label: 'Night' }, { value: 'on-call', label: 'On-Call' }
      ]},
      { key: 'startTime', label: 'Start Time', type: 'time' },
      { key: 'endTime', label: 'End Time', type: 'time' },
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: 'scheduled', label: 'Scheduled' }, { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ], badge: true },
      { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
    ],
    'equipment': [
      { key: 'patientId', label: 'Patient ID', type: 'number', required: true },
      { key: 'equipmentName', label: 'Equipment Name', required: true },
      { key: 'category', label: 'Category', type: 'select', options: [
        { value: 'Bed', label: 'Bed' }, { value: 'Respiratory', label: 'Respiratory' },
        { value: 'Mobility', label: 'Mobility' }, { value: 'Bathroom', label: 'Bathroom' },
        { value: 'Infusion', label: 'Infusion' }, { value: 'Communication', label: 'Communication' },
        { value: 'Safety', label: 'Safety' }
      ]},
      { key: 'vendor', label: 'Vendor' },
      { key: 'orderDate', label: 'Order Date', type: 'date' },
      { key: 'deliveryDate', label: 'Delivery Date', type: 'date' },
      { key: 'returnDate', label: 'Return Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: 'ordered', label: 'Ordered' }, { value: 'delivered', label: 'Delivered' },
        { value: 'returned', label: 'Returned' }
      ], badge: true },
      { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
    ],
    'supplies': [
      { key: 'itemName', label: 'Item Name', required: true },
      { key: 'category', label: 'Category', type: 'select', options: [
        { value: 'Incontinence', label: 'Incontinence' }, { value: 'Emergency Kit', label: 'Emergency Kit' },
        { value: 'Wound Care', label: 'Wound Care' }, { value: 'PPE', label: 'PPE' },
        { value: 'Catheter', label: 'Catheter' }, { value: 'Respiratory', label: 'Respiratory' },
        { value: 'Comfort', label: 'Comfort' }, { value: 'Skin Care', label: 'Skin Care' },
        { value: 'Supplies', label: 'General Supplies' }
      ]},
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'reorderLevel', label: 'Reorder Level', type: 'number' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'unitCost', label: 'Unit Cost ($)', type: 'number', step: '0.01' },
      { key: 'lastOrderDate', label: 'Last Order Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: 'in_stock', label: 'In Stock' }, { value: 'low_stock', label: 'Low Stock' },
        { value: 'out_of_stock', label: 'Out of Stock' }
      ], badge: true },
    ],
    'gip-beds': [
      { key: 'facilityName', label: 'Facility', required: true },
      { key: 'bedNumber', label: 'Bed Number', required: true },
      { key: 'patientId', label: 'Patient ID', type: 'number' },
      { key: 'admissionDate', label: 'Admission Date', type: 'date' },
      { key: 'dischargeDate', label: 'Discharge Date', type: 'date' },
      { key: 'reason', label: 'Reason', type: 'textarea', fullWidth: true },
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: 'available', label: 'Available' }, { value: 'occupied', label: 'Occupied' },
        { value: 'reserved', label: 'Reserved' }, { value: 'maintenance', label: 'Maintenance' },
        { value: 'cleaning', label: 'Cleaning' }
      ], badge: true },
      { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
    ],
    'certifications': [
      { key: 'patientId', label: 'Patient ID', type: 'number', required: true },
      { key: 'benefitPeriod', label: 'Benefit Period', type: 'number' },
      { key: 'startDate', label: 'Start Date', type: 'date' },
      { key: 'endDate', label: 'End Date', type: 'date' },
      { key: 'certifyingPhysician', label: 'Certifying Physician' },
      { key: 'f2fDate', label: 'F2F Encounter Date', type: 'date' },
      { key: 'f2fPhysician', label: 'F2F Physician' },
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: 'active', label: 'Active' }, { value: 'expired', label: 'Expired' },
        { value: 'pending', label: 'Pending' }
      ], badge: true },
      { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
    ],
    'billing': [
      { key: 'patientId', label: 'Patient ID', type: 'number', required: true },
      { key: 'serviceDate', label: 'Service Date', type: 'date' },
      { key: 'levelOfCare', label: 'Level of Care', type: 'select', options: LOC_OPTIONS },
      { key: 'payerType', label: 'Payer', type: 'select', options: INSURANCE_OPTIONS },
      { key: 'claimAmount', label: 'Claim Amount ($)', type: 'number', step: '0.01' },
      { key: 'paidAmount', label: 'Paid Amount ($)', type: 'number', step: '0.01' },
      { key: 'billingCode', label: 'Billing Code' },
      { key: 'claimStatus', label: 'Claim Status', type: 'select', badge: true, options: [
        { value: 'pending', label: 'Pending' }, { value: 'submitted', label: 'Submitted' },
        { value: 'paid', label: 'Paid' }, { value: 'partial', label: 'Partial' },
        { value: 'denied', label: 'Denied' }
      ]},
      { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
    ],
    'quality-measures': [
      { key: 'measureType', label: 'Measure Type', type: 'select', required: true, options: [
        { value: 'CAHPS', label: 'CAHPS' }, { value: 'HIS', label: 'HIS' }
      ]},
      { key: 'measureName', label: 'Measure Name', required: true },
      { key: 'period', label: 'Period' },
      { key: 'score', label: 'Score (%)', type: 'number', step: '0.1' },
      { key: 'benchmark', label: 'Benchmark (%)', type: 'number', step: '0.1' },
      { key: 'patientId', label: 'Patient ID (optional)', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
    ],
    'compliance': [
      { key: 'documentType', label: 'Document Type', type: 'select', options: [
        { value: 'Certification', label: 'Certification' }, { value: 'Recertification', label: 'Recertification' },
        { value: 'F2F', label: 'Face-to-Face' }, { value: 'Care Plan', label: 'Care Plan' },
        { value: 'Election', label: 'Election Statement' }, { value: 'Revocation', label: 'Revocation' },
        { value: 'QAPI', label: 'QAPI' }, { value: 'Survey Prep', label: 'Survey Prep' },
        { value: 'Policy', label: 'Policy' }, { value: 'Training', label: 'Training' },
        { value: 'Audit', label: 'Audit' }, { value: 'Incident', label: 'Incident Report' }
      ]},
      { key: 'title', label: 'Title', required: true },
      { key: 'patientId', label: 'Patient ID', type: 'number' },
      { key: 'content', label: 'Content', type: 'textarea', fullWidth: true },
      { key: 'dueDate', label: 'Due Date', type: 'date' },
      { key: 'completedDate', label: 'Completed Date', type: 'date' },
      { key: 'assignedTo', label: 'Assigned To' },
      { key: 'status', label: 'Status', type: 'select', badge: true, options: [
        { value: 'pending', label: 'Pending' }, { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' }, { value: 'overdue', label: 'Overdue' }
      ]},
    ],
    'team-meetings': [
      { key: 'patientId', label: 'Patient ID', type: 'number' },
      { key: 'meetingDate', label: 'Meeting Date/Time', type: 'datetime-local' },
      { key: 'attendees', label: 'Attendees', type: 'textarea', fullWidth: true },
      { key: 'agenda', label: 'Agenda', type: 'textarea', fullWidth: true },
      { key: 'discussion', label: 'Discussion', type: 'textarea', fullWidth: true },
      { key: 'decisions', label: 'Decisions', type: 'textarea', fullWidth: true },
      { key: 'actionItems', label: 'Action Items', type: 'textarea', fullWidth: true },
      { key: 'status', label: 'Status', type: 'select', badge: true, options: [
        { value: 'scheduled', label: 'Scheduled' }, { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]},
    ],
    'surveys': [
      { key: 'patientId', label: 'Patient ID', type: 'number' },
      { key: 'respondentName', label: 'Respondent Name', required: true },
      { key: 'relationship', label: 'Relationship' },
      { key: 'surveyDate', label: 'Survey Date', type: 'date' },
      { key: 'overallRating', label: 'Overall Rating (1-10)', type: 'number', min: 1, max: 10 },
      { key: 'painManagement', label: 'Pain Management (1-10)', type: 'number', min: 1, max: 10 },
      { key: 'communication', label: 'Communication (1-10)', type: 'number', min: 1, max: 10 },
      { key: 'emotionalSupport', label: 'Emotional Support (1-10)', type: 'number', min: 1, max: 10 },
      { key: 'teamResponsiveness', label: 'Team Responsiveness (1-10)', type: 'number', min: 1, max: 10 },
      { key: 'comments', label: 'Comments', type: 'textarea', fullWidth: true },
      { key: 'status', label: 'Status', type: 'select', badge: true, options: [
        { value: 'completed', label: 'Completed' }, { value: 'pending', label: 'Pending' }
      ]},
    ],
  };
  return configs[featureKey] || [];
}
