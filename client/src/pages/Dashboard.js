import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ features, onNavigate, token }) {
  const [stats, setStats] = useState(null);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    axios.get('/api/dashboard', { headers }).then(r => setStats(r.data)).catch(() => {});

    // Fetch counts for all features
    features.forEach(f => {
      axios.get(f.endpoint, { headers })
        .then(r => setCounts(prev => ({ ...prev, [f.key]: Array.isArray(r.data) ? r.data.length : 0 })))
        .catch(() => {});
    });
  }, [token]);

  const statCards = stats ? [
    { label: 'Active Patients', value: stats.activePatients, icon: '👤', bg: '#e6f3ff' },
    { label: 'Scheduled Visits', value: stats.todayVisits, icon: '📅', bg: '#fff3e0' },
    { label: 'Pending Bills', value: stats.pendingBills, icon: '💰', bg: '#fce4ec' },
    { label: 'Active Volunteers', value: stats.activeVolunteers, icon: '🤗', bg: '#e0f2f1' },
    { label: 'Total Patients', value: stats.totalPatients, icon: '📊', bg: '#f3e5f5' },
    { label: 'Active Certifications', value: stats.activeCertifications, icon: '📜', bg: '#e8f5e9' },
    { label: 'Bereavement Active', value: stats.bereavementActive, icon: '🕊️', bg: '#efebe9' },
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
    </div>
  );
}

export default Dashboard;
