import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import FormModal from '../components/FormModal';
import DetailModal from '../components/DetailModal';
import AIPanel from '../components/AIPanel';
import { getColumns, getFormFields } from '../components/FieldConfig';

function FeaturePage({ feature, token, onBack, features }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showAI, setShowAI] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(feature.endpoint, { headers });
      setItems(res.data);
    } catch (err) {
      toast.error('Failed to load data');
    }
    setLoading(false);
  }, [feature.endpoint]);

  useEffect(() => {
    fetchItems();
    setShowForm(false);
    setShowDetail(null);
    setEditItem(null);
    setShowAI(false);
  }, [feature.key]);

  const handleCreate = async (data) => {
    try {
      await axios.post(feature.endpoint, data, { headers });
      toast.success(`${feature.label} created successfully`);
      setShowForm(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await axios.put(`${feature.endpoint}/${editItem.id}`, data, { headers });
      toast.success(`${feature.label} updated successfully`);
      setEditItem(null);
      setShowForm(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`${feature.endpoint}/${id}`, { headers });
      toast.success('Deleted successfully');
      setShowDetail(null);
      fetchItems();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const columns = getColumns(feature.key);
  const formFields = getFormFields(feature.key);

  // AI features mapping
  const aiFeatures = {
    'patients': [
      { label: 'Generate Care Plan Narrative', endpoint: '/api/ai/care-plan-narrative', paramKey: 'patientId' },
      { label: 'Symptom Recommendations', endpoint: '/api/ai/symptom-recommendations', paramKey: 'patientId' },
      { label: 'Comfort Measure Suggestions', endpoint: '/api/ai/comfort-measures', paramKey: 'patientId' },
      { label: 'Family Communication Draft', endpoint: '/api/ai/family-communication', paramKey: 'patientId' },
      { label: 'Compliance Documentation', endpoint: '/api/ai/compliance-documentation', paramKey: 'patientId' },
      { label: 'Bereavement Resources', endpoint: '/api/ai/bereavement-resources', paramKey: 'patientId' },
    ],
    'care-plans': [
      { label: 'Generate Care Plan Narrative', endpoint: '/api/ai/care-plan-narrative', paramKey: 'patientId' },
    ],
    'medications': [
      { label: 'Symptom Management Recommendations', endpoint: '/api/ai/symptom-recommendations', paramKey: 'patientId' },
      { label: 'Comfort Measure Suggestions', endpoint: '/api/ai/comfort-measures', paramKey: 'patientId' },
    ],
    'symptoms': [
      { label: 'Symptom Management Recommendations', endpoint: '/api/ai/symptom-recommendations', paramKey: 'patientId' },
      { label: 'Comfort Measure Suggestions', endpoint: '/api/ai/comfort-measures', paramKey: 'patientId' },
    ],
    'family-members': [
      { label: 'Family Communication Draft', endpoint: '/api/ai/family-communication', paramKey: 'patientId' },
      { label: 'Bereavement Resources', endpoint: '/api/ai/bereavement-resources', paramKey: 'patientId' },
    ],
    'bereavement': [
      { label: 'Bereavement Resources', endpoint: '/api/ai/bereavement-resources', paramKey: 'patientId' },
    ],
    'team-meetings': [
      { label: 'Generate Meeting Summary', endpoint: '/api/ai/meeting-summary', paramKey: 'meetingId', useItemId: true },
    ],
    'certifications': [
      { label: 'Compliance Documentation', endpoint: '/api/ai/compliance-documentation', paramKey: 'patientId' },
    ],
    'compliance': [
      { label: 'Compliance Documentation', endpoint: '/api/ai/compliance-documentation', paramKey: 'patientId' },
    ],
  };

  const hasAI = aiFeatures[feature.key];

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>

      <div className="page-header">
        <div>
          <h1>{feature.icon} {feature.label}</h1>
          <p>{feature.desc}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {hasAI && (
            <button className="btn btn-ai" onClick={() => setShowAI(!showAI)}>
              🤖 AI Assistant
            </button>
          )}
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
            + New {feature.label.replace(/s$/, '').replace(/ies$/, 'y')}
          </button>
        </div>
      </div>

      {showAI && hasAI && (
        <AIPanel
          aiFeatures={hasAI}
          items={items}
          token={token}
          featureKey={feature.key}
        />
      )}

      <div className="data-section">
        <div className="data-header">
          <h2>All Records ({items.length})</h2>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="ai-loading"><div className="spinner"></div> Loading...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{feature.icon}</div>
            <h3>No records found</h3>
            <p>Get started by creating a new record.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Create First Record
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} onClick={() => setShowDetail(item)}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(item[col.key], item) : (
                        col.badge ? (
                          <span className={`badge badge-${item[col.key]}`}>{item[col.key]}</span>
                        ) : (
                          String(item[col.key] ?? '')
                        )
                      )}
                    </td>
                  ))}
                  <td>
                    <div className="actions" onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setEditItem(item); setShowForm(true); }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <FormModal
          title={editItem ? `Edit ${feature.label}` : `New ${feature.label}`}
          fields={formFields}
          initialData={editItem || {}}
          onSubmit={editItem ? handleUpdate : handleCreate}
          onClose={() => { setShowForm(false); setEditItem(null); }}
        />
      )}

      {showDetail && (
        <DetailModal
          title={feature.label}
          item={showDetail}
          fields={formFields}
          onClose={() => setShowDetail(null)}
          onEdit={() => { setEditItem(showDetail); setShowForm(true); setShowDetail(null); }}
          onDelete={() => handleDelete(showDetail.id)}
        />
      )}
    </div>
  );
}

export default FeaturePage;
