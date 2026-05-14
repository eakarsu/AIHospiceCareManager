import React from 'react';

function Sidebar({ features, currentPage, onNavigate, user, onLogout }) {
  const sections = {};
  features.forEach(f => {
    if (!sections[f.section]) sections[f.section] = [];
    sections[f.section].push(f);
  });

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>🏥 Hospice Care</h2>
        <span>AI-Powered Platform</span>
      </div>

      <div className="sidebar-nav">
        <button
          className={currentPage === 'dashboard' ? 'active' : ''}
          onClick={() => onNavigate('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={currentPage === 'advanced-ai' ? 'active' : ''}
          onClick={() => onNavigate('advanced-ai')}
        >
          🤖 Advanced AI
        </button>

        {Object.entries(sections).map(([section, items]) => (
          <React.Fragment key={section}>
            <div className="sidebar-section">{section}</div>
            {items.map(f => (
              <button
                key={f.key}
                className={currentPage === f.key ? 'active' : ''}
                onClick={() => onNavigate(f.key)}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className="sidebar-logout">
        <div style={{ padding: '0 4px 12px', fontSize: '13px', opacity: 0.7 }}>
          {user?.name}
        </div>
        <button onClick={onLogout}>Sign Out</button>
      </div>
    </div>
  );
}

export default Sidebar;
