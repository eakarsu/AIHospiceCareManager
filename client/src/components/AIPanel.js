import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function AIPanel({ aiFeatures, items, token, featureKey }) {
  const [selectedAI, setSelectedAI] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [extraFields, setExtraFields] = useState({});

  const headers = { Authorization: `Bearer ${token}` };

  const runAI = async () => {
    if (!selectedAI) {
      toast.warning('Please select an AI feature');
      return;
    }
    if (!selectedItemId && !selectedAI.useItemId) {
      toast.warning('Please select a record');
      return;
    }

    setAiLoading(true);
    setAiResult(null);

    try {
      const body = selectedAI.useItemId
        ? { [selectedAI.paramKey]: selectedItemId }
        : { [selectedAI.paramKey]: parseInt(selectedItemId), ...extraFields };

      const res = await axios.post(selectedAI.endpoint, body, { headers });
      setAiResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI request failed. Check your OpenRouter API key.');
    }
    setAiLoading(false);
  };

  const renderMarkdown = (text) => {
    if (!text) return '';
    // Simple markdown rendering
    let html = text
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');

    // Wrap consecutive <li> items in <ul>
    html = html.replace(/(<li>.*?<\/li>(\s*<br\/>)?)+/g, (match) => {
      return '<ul>' + match.replace(/<br\/>/g, '') + '</ul>';
    });

    return '<p>' + html + '</p>';
  };

  // Get items for the dropdown - show patient names or appropriate identifiers
  const getItemLabel = (item) => {
    if (item.firstName && item.lastName) return `${item.firstName} ${item.lastName}`;
    if (item.name) return item.name;
    if (item.title) return item.title;
    if (item.staffName) return item.staffName;
    if (item.contactName) return item.contactName;
    if (item.measureName) return item.measureName;
    if (item.itemName) return item.itemName;
    if (item.equipmentName) return item.equipmentName;
    if (item.meetingDate) return `Meeting: ${new Date(item.meetingDate).toLocaleDateString()}`;
    return `Record #${item.id}`;
  };

  // Communication types for family communication
  const communicationTypes = [
    { value: 'update', label: 'Status Update' },
    { value: 'transition', label: 'Transition of Care' },
    { value: 'symptom_change', label: 'Symptom Change Notification' },
    { value: 'condolence', label: 'Condolence Letter' },
    { value: 'bereavement_check', label: 'Bereavement Check-in' },
  ];

  return (
    <div className="ai-result" style={{ marginBottom: '24px' }}>
      <div className="ai-result-header">
        <span className="ai-badge">AI ASSISTANT</span>
        <h3>Powered by OpenRouter</h3>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <select
          style={{ flex: '1', minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '2px solid #e9d8fd', fontSize: '14px', fontFamily: 'inherit' }}
          value={selectedAI ? JSON.stringify(selectedAI) : ''}
          onChange={e => {
            setSelectedAI(e.target.value ? JSON.parse(e.target.value) : null);
            setAiResult(null);
          }}
        >
          <option value="">Select AI Feature...</option>
          {aiFeatures.map((af, i) => (
            <option key={i} value={JSON.stringify(af)}>{af.label}</option>
          ))}
        </select>

        <select
          style={{ flex: '1', minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '2px solid #e9d8fd', fontSize: '14px', fontFamily: 'inherit' }}
          value={selectedItemId}
          onChange={e => setSelectedItemId(e.target.value)}
        >
          <option value="">Select Record...</option>
          {items.map(item => (
            <option key={item.id} value={selectedAI?.useItemId ? item.id : (item.patientId || item.id)}>
              {getItemLabel(item)}
            </option>
          ))}
        </select>

        {selectedAI?.endpoint === '/api/ai/family-communication' && (
          <select
            style={{ flex: '1', minWidth: '180px', padding: '10px 14px', borderRadius: '8px', border: '2px solid #e9d8fd', fontSize: '14px', fontFamily: 'inherit' }}
            value={extraFields.communicationType || ''}
            onChange={e => setExtraFields(prev => ({ ...prev, communicationType: e.target.value }))}
          >
            <option value="">Communication Type...</option>
            {communicationTypes.map(ct => (
              <option key={ct.value} value={ct.value}>{ct.label}</option>
            ))}
          </select>
        )}

        <button className="btn btn-ai" onClick={runAI} disabled={aiLoading}>
          {aiLoading ? '⏳ Generating...' : '🤖 Generate'}
        </button>
      </div>

      {aiLoading && (
        <div className="ai-loading">
          <div className="spinner"></div>
          AI is analyzing data and generating recommendations...
        </div>
      )}

      {aiResult && (
        <div>
          <div className="ai-result-header" style={{ marginTop: '16px' }}>
            <span className="ai-badge">{aiResult.type?.replace(/-/g, ' ').toUpperCase()}</span>
          </div>
          <div
            className="ai-result-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(aiResult.result) }}
          />
        </div>
      )}
    </div>
  );
}

export default AIPanel;
