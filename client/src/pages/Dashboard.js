import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function BereavementContactModal({ contact, onClose, onMarkContacted }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 12, padding: 28, maxWidth: 600, width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: '#1a365d' }}>Bereavement Message — Month {contact.due_at_month}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#718096' }}>&times;</button>
        </div>
        <div style={{ marginBottom: 12, color: '#4a5568', fontSize: 14 }}>
          Family: <strong>{contact.family_name}</strong> | Patient: <strong>{contact.patient_name}</strong>
        </div>
        {contact.suggested_message ? (
          <div>
            <div style={{ background: '#e6fffa', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: '#276749', marginBottom: 8 }}>Subject: {contact.suggested_message.subject}</div>
              <div style={{ fontSize: 13, color: '#718096', marginBottom: 12 }}>Tone: {contact.suggested_message.tone}</div>
              <div style={{ color: '#2d3748', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{contact.suggested_message.message}</div>
            </div>
          </div>
        ) : (
          <div style={{ color: '#718096', padding: 16 }}>No AI message generated for this contact.</div>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button
            style={{ padding: '10px 20px', background: '#38a169', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
            onClick={() => { onMarkContacted(contact.bereavement_id); onClose(); }}
          >
            Mark as Contacted
          </button>
          <button
            style={{ padding: '10px 20px', background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ features, onNavigate, token }) {
  const [stats, setStats] = useState(null);
  const [counts, setCounts] = useState({});
  const [bereavementDue, setBereavementDue] = useState([]);
  const [bereavementLoading, setBereavementLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    axios.get('/api/dashboard', { headers }).then(r => setStats(r.data)).catch(() => {});

    // Fetch counts for all features
    features.forEach(f => {
      axios.get(`${f.endpoint}?page=1&limit=1`, { headers })
        .then(r => {
          const count = r.data?.pagination?.total ?? (Array.isArray(r.data) ? r.data.length : 0);
          setCounts(prev => ({ ...prev, [f.key]: count }));
        })
        .catch(() => {});
    });
  }, [token]);

  const loadBereavementDue = async () => {
    setBereavementLoading(true);
    try {
      const { data } = await axios.get('/api/bereavement/due-contacts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBereavementDue(data || []);
    } catch (err) {
      toast.error('Failed to load bereavement due contacts');
    }
    setBereavementLoading(false);
  };

  const handleMarkContacted = async (bereavementId) => {
    try {
      await axios.put(`/api/bereavement/${bereavementId}`, {
        lastContactDate: new Date().toISOString().split('T')[0],
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Marked as contacted');
      setBereavementDue(prev => prev.filter(b => b.bereavement_id !== bereavementId));
    } catch (err) {
      toast.error('Failed to mark contact');
    }
  };

  const statCards = stats ? [
    { label: 'Active Patients', value: stats.activePatients, icon: 'P', bg: '#e6f3ff' },
    { label: 'Scheduled Visits', value: stats.todayVisits, icon: 'V', bg: '#fff3e0' },
    { label: 'Pending Bills', value: stats.pendingBills, icon: '$', bg: '#fce4ec' },
    { label: 'Active Volunteers', value: stats.activeVolunteers, icon: 'V', bg: '#e0f2f1' },
    { label: 'Total Patients', value: stats.totalPatients, icon: 'T', bg: '#f3e5f5' },
    { label: 'Active Certifications', value: stats.activeCertifications, icon: 'C', bg: '#e8f5e9' },
    { label: 'Bereavement Active', value: stats.bereavementActive, icon: 'B', bg: '#efebe9' },
  ] : [];

  const sections = {};
  features.forEach(f => {
    if (!sections[f.section]) sections[f.section] = [];
    sections[f.section].push(f);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>AI-Powered Hospice Care Management System</p>
        </div>
      </div>

      {stats && (
        <div className="dashboard-stats">
          {statCards.map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bereavement Due Contacts */}
      <div style={{ margin: '28px 0', background: '#f7fafc', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a365d' }}>
            Bereavement Due Contacts
          </h2>
          <button
            className="btn btn-ai"
            onClick={loadBereavementDue}
            disabled={bereavementLoading}
          >
            {bereavementLoading ? 'Loading...' : 'Check Due Contacts'}
          </button>
        </div>

        {bereavementDue.length === 0 && !bereavementLoading && (
          <p style={{ color: '#718096', fontSize: 14 }}>
            Click "Check Due Contacts" to find families due for bereavement follow-up this period.
          </p>
        )}

        {bereavementDue.length > 0 && (
          <div style={{ display: 'grid', gap: 12 }}>
            {bereavementDue.map((contact) => (
              <div key={contact.bereavement_id} style={{
                background: 'white', borderRadius: 8, padding: '14px 18px',
                border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#2d3748' }}>{contact.family_name || 'Unknown'}</div>
                  <div style={{ fontSize: 13, color: '#718096' }}>
                    Patient: {contact.patient_name} — Month {contact.months} completed (Month {contact.due_at_month} contact due)
                  </div>
                </div>
                <button
                  style={{ padding: '8px 16px', background: '#6b46c1', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  onClick={() => setSelectedContact(contact)}
                >
                  Generate Message
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {Object.entries(sections).map(([section, items]) => (
        <div key={section}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '28px 0 16px', color: '#1a365d' }}>
            {section}
          </h2>
          <div className="feature-grid">
            {items.map(f => (
              <div
                key={f.key}
                className="feature-card"
                onClick={() => onNavigate(f.key)}
              >
                <div className="card-icon" style={{ background: f.color }}>{f.icon}</div>
                <span className="card-count">{counts[f.key] || 0}</span>
                <h3>{f.label}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedContact && (
        <BereavementContactModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onMarkContacted={handleMarkContacted}
        />
      )}
    </div>
  );
}

export default Dashboard;
