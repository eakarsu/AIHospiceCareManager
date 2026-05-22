import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import AdvancedAITools from './pages/AdvancedAITools';
import Sidebar from './components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// === Batch 04 Gaps & Frontend Mounts ===
import CfAgenticHospiceCareCoordinatorSchedul from './pages/CfAgenticHospiceCareCoordinatorSchedul';
import CfLegacyLetterPlatformWithPatientReco from './pages/CfLegacyLetterPlatformWithPatientReco';
import CfPainManagementAiAdvisorMonitoringSy from './pages/CfPainManagementAiAdvisorMonitoringSy';
import CfGriefStageDetectionAdaptiveSupportR from './pages/CfGriefStageDetectionAdaptiveSupportR';
import CfVolunteerChaplainSchedulingMatchingS from './pages/CfVolunteerChaplainSchedulingMatchingS';
import CfAdvanceCarePlanningCoPilotGuiding from './pages/CfAdvanceCarePlanningCoPilotGuiding';
import GapNoAdvanceDirectiveSummarizerForCare from './pages/GapNoAdvanceDirectiveSummarizerForCare';
import GapNoFamilyMeetingAgendaGenerator from './pages/GapNoFamilyMeetingAgendaGenerator';
import GapNoVolunteerNeedMatchingAi from './pages/GapNoVolunteerNeedMatchingAi';
import GapNoMedicationTrackingModule from './pages/GapNoMedicationTrackingModule';
import GapNoStandardizedPainsymptomAssessmentF from './pages/GapNoStandardizedPainsymptomAssessmentF';
import GapNoVolunteerCoordinationModule from './pages/GapNoVolunteerCoordinationModule';
import GapNoWebhookSurface from './pages/GapNoWebhookSurface';
import GapNoFileUploadForAdvanceDirectives from './pages/GapNoFileUploadForAdvanceDirectives';
import GapNoPaymentBillingModule from './pages/GapNoPaymentBillingModule';
import ComfortKitRefillPredictor from './pages/ComfortKitRefillPredictor';

const FEATURES = [
  { key: 'patients', label: 'Patient Management', icon: '👤', endpoint: '/api/patients', color: '#e6f3ff', desc: 'Admission, enrollment & diagnosis tracking', section: 'Clinical' },
  { key: 'care-plans', label: 'Care Plans', icon: '📋', endpoint: '/api/care-plans', color: '#e8f5e9', desc: 'Interdisciplinary care planning (IDT)', section: 'Clinical', patientLinked: true },
  { key: 'visits', label: 'Visit Scheduling', icon: '📅', endpoint: '/api/visits', color: '#fff3e0', desc: 'Visit scheduling & documentation', section: 'Clinical', patientLinked: true },
  { key: 'medications', label: 'Medications', icon: '💊', endpoint: '/api/medications', color: '#fce4ec', desc: 'Comfort meds & pain control management', section: 'Clinical', patientLinked: true },
  { key: 'symptoms', label: 'Symptom Tracking', icon: '📊', endpoint: '/api/symptoms', color: '#f3e5f5', desc: 'Pain scale, nausea, anxiety, dyspnea tracking', section: 'Clinical', patientLinked: true },
  { key: 'family-members', label: 'Family & Caregivers', icon: '👨‍👩‍👧', endpoint: '/api/family-members', color: '#e0f7fa', desc: 'Family/caregiver profiles & POA tracking', section: 'Clinical', patientLinked: true },
  { key: 'bereavement', label: 'Bereavement Program', icon: '🕊️', endpoint: '/api/bereavement', color: '#efebe9', desc: '13-month follow-up bereavement support', section: 'Clinical', patientLinked: true },
  { key: 'spiritual-care', label: 'Spiritual Care', icon: '🙏', endpoint: '/api/spiritual-care', color: '#fff8e1', desc: 'Chaplain visits & spiritual needs tracking', section: 'Clinical', patientLinked: true },
  { key: 'social-work', label: 'Social Work', icon: '🤝', endpoint: '/api/social-work', color: '#e8eaf6', desc: 'Psychosocial assessments & resources', section: 'Clinical', patientLinked: true },
  { key: 'volunteers', label: 'Volunteer Coordination', icon: '🤗', endpoint: '/api/volunteers', color: '#e0f2f1', desc: 'Volunteer management & hour tracking', section: 'Operations' },
  { key: 'schedules', label: 'Staff Scheduling', icon: '🗓️', endpoint: '/api/schedules', color: '#fbe9e7', desc: 'On-call scheduling & shift management', section: 'Operations' },
  { key: 'equipment', label: 'DME Orders', icon: '🏥', endpoint: '/api/equipment', color: '#e1f5fe', desc: 'Durable medical equipment ordering', section: 'Operations', patientLinked: true },
  { key: 'supplies', label: 'Supply Management', icon: '📦', endpoint: '/api/supplies', color: '#f1f8e9', desc: 'Supply inventory & emergency kit tracking', section: 'Operations' },
  { key: 'gip-beds', label: 'GIP Bed Management', icon: '🛏️', endpoint: '/api/gip-beds', color: '#fce4ec', desc: 'General inpatient bed availability', section: 'Operations' },
  { key: 'certifications', label: 'Certifications', icon: '📜', endpoint: '/api/certifications', color: '#e8f5e9', desc: 'Medicare benefit period tracking', section: 'Compliance', patientLinked: true },
  { key: 'billing', label: 'Billing', icon: '💰', endpoint: '/api/billing', color: '#fff3e0', desc: 'Medicare/Medicaid/private billing', section: 'Compliance', patientLinked: true },
  { key: 'quality-measures', label: 'Quality Measures', icon: '⭐', endpoint: '/api/quality-measures', color: '#f3e5f5', desc: 'CAHPS & HIS quality tracking', section: 'Compliance' },
  { key: 'compliance', label: 'Compliance Docs', icon: '📑', endpoint: '/api/compliance', color: '#e0f7fa', desc: 'Regulatory compliance documentation', section: 'Compliance' },
  { key: 'team-meetings', label: 'IDT Meetings', icon: '👥', endpoint: '/api/team-meetings', color: '#efebe9', desc: 'Interdisciplinary team meeting management', section: 'Compliance' },
  { key: 'surveys', label: 'Family Surveys', icon: '📝', endpoint: '/api/surveys', color: '#e8eaf6', desc: 'Family satisfaction survey tracking', section: 'Compliance' },
  { key: 'comfort-kit-refill-predictor', label: 'Comfort Kit Refill', icon: '🧰', endpoint: '/api/comfort-kit-refill-predictor', color: '#e1f5fe', desc: 'Predicts urgent comfort-kit refill needs', section: 'Clinical' },
];

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (!token) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <ToastContainer position="top-right" autoClose={3000} />
      </>
    );
  }

  const currentFeature = FEATURES.find(f => f.key === currentPage);

  return (
    <div className="app-layout">
      <Sidebar
        features={FEATURES}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />
      <main className="main-content">
        {currentPage === 'dashboard' ? (
          <Dashboard features={FEATURES} onNavigate={setCurrentPage} token={token} />
        ) : currentPage === 'advanced-ai' ? (
          <AdvancedAITools token={token} />
        ) : currentPage === 'comfort-kit-refill-predictor' ? (
          <ComfortKitRefillPredictor token={token} />
        ) : (
          <FeaturePage
            feature={currentFeature}
            token={token}
            onBack={() => setCurrentPage('dashboard')}
            features={FEATURES}
          />
        )}
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
