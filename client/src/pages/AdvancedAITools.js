import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TOOLS = [
  {
    id: 'advance-directive-summarizer',
    label: 'Advance Directive Summarizer',
    icon: '📄',
    endpoint: '/api/ai/advance-directive-summarizer',
    desc: 'Concise summary of resuscitation, intubation, nutrition/hydration, antibiotics, transfer preferences with explicit ambiguity flags.',
    fields: [
      { name: 'patientId', label: 'Patient', type: 'patient', required: true },
      { name: 'directive_text', label: 'Advance Directive Text (optional)', type: 'textarea', placeholder: 'Optional: paste a directive document or notes if not already on file.' },
    ],
  },
  {
    id: 'family-meeting-agenda-generator',
    label: 'Family Meeting Agenda Generator',
    icon: '👨‍👩‍👧',
    endpoint: '/api/ai/family-meeting-agenda-generator',
    desc: 'Patient-tailored meeting agenda with timed topics, lead clinician, family questions, decisions, and tone guidance.',
    fields: [
      { name: 'patientId', label: 'Patient', type: 'patient', required: true },
      { name: 'meeting_purpose', label: 'Meeting Purpose', type: 'select', options: ['Goals of care', 'Symptom escalation', 'Transition of care', 'Bereavement preparation', 'IDT review', 'Other'] },
      { name: 'attendees', label: 'Attendees (comma-separated)', type: 'text', placeholder: 'Spouse, daughter, social worker, chaplain' },
      { name: 'duration_minutes', label: 'Duration (minutes)', type: 'number', placeholder: '60' },
      { name: 'concerns', label: 'Family Concerns / Sensitive Topics', type: 'textarea', placeholder: 'e.g., conflict over feeding tube, religious considerations' },
    ],
  },
];

function renderStructured(structured) {
  if (!structured || typeof structured !== 'object') return null;
  return (
    <pre style={{ background: '#f7fafc', borderRadius: 8, padding: 14, overflow: 'auto', fontSize: 13, color: '#2d3748' }}>
      {JSON.stringify(structured, null, 2)}
    </pre>
  );
}

function renderMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  html = html.replace(/(<li>.*?<\/li>(\s*<br\/>)?)+/g, (match) => '<ul>' + match.replace(/<br\/>/g, '') + '</ul>');
  return '<p>' + html + '</p>';
}

function AdvancedAITools({ token }) {
  const [tool, setTool] = useState(TOOLS[0]);
  const [formData, setFormData] = useState({});
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios
      .get('/api/patients?page=1&limit=200', { headers })
      .then((res) => {
        const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setPatients(data);
      })
      .catch(() => setPatients([]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchTool = (t) => {
    setTool(t);
    setFormData({});
    setResult(null);
    setError(null);
  };

  const setField = (name, value) => setFormData((p) => ({ ...p, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    for (const f of tool.fields) {
      if (f.required && !formData[f.name]) {
        toast.warning(`${f.label} is required`);
        return;
      }
    }
    setLoading(true);
    try {
      const body = {};
      tool.fields.forEach((f) => {
        const v = formData[f.name];
        if (v === '' || v === undefined || v === null) return;
        body[f.name] = f.type === 'number' ? Number(v) : v;
      });
      const res = await axios.post(tool.endpoint, body, { headers });
      setResult(res.data);
    } catch (err) {
      const status = err.response?.status;
      const msg = status === 429
        ? 'AI rate limit exceeded.'
        : (err.response?.data?.error || err.message || 'Request failed');
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🤖 Advanced AI Tools</h1>
          <p>Advance directive summarization and family meeting agenda generation</p>
        </div>
      </div>

      <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 6, padding: '8px 14px', marginBottom: 14, fontSize: 13, color: '#856404' }}>
        <strong>Clinical AI</strong> — For internal care team use only. Do not share PHI outputs externally.
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {TOOLS.map((t) => (
          <button
            key={t.id}
            className={`btn ${tool.id === t.id ? 'btn-ai' : 'btn-secondary'}`}
            onClick={() => switchTool(t)}
          >
            <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="data-section" style={{ padding: 20 }}>
        <h2>{tool.icon} {tool.label}</h2>
        <p style={{ color: '#718096', marginBottom: 16 }}>{tool.desc}</p>
        <form onSubmit={submit}>
          {tool.fields.map((f) => (
            <div key={f.name} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13, color: '#4a5568' }}>
                {f.label} {f.required && <span style={{ color: '#e53e3e' }}>*</span>}
              </label>
              {f.type === 'patient' ? (
                <select
                  value={formData[f.name] || ''}
                  onChange={(e) => setField(f.name, e.target.value ? Number(e.target.value) : '')}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e9d8fd', fontSize: 14 }}
                >
                  <option value="">Select Patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName || p.first_name || ''} {p.lastName || p.last_name || ''} (#{p.id})
                    </option>
                  ))}
                </select>
              ) : f.type === 'select' ? (
                <select
                  value={formData[f.name] || ''}
                  onChange={(e) => setField(f.name, e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e9d8fd', fontSize: 14 }}
                >
                  <option value="">Select...</option>
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  value={formData[f.name] || ''}
                  placeholder={f.placeholder || ''}
                  rows={4}
                  onChange={(e) => setField(f.name, e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e9d8fd', fontSize: 14, fontFamily: 'inherit' }}
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  value={formData[f.name] || ''}
                  placeholder={f.placeholder || ''}
                  onChange={(e) => setField(f.name, e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '2px solid #e9d8fd', fontSize: 14 }}
                />
              )}
            </div>
          ))}
          <button type="submit" className="btn btn-ai" disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {loading && (
          <div className="ai-loading" style={{ marginTop: 16 }}>
            <div className="spinner"></div>
            AI is generating the response...
          </div>
        )}

        {error && (
          <div style={{ marginTop: 16, padding: 12, background: '#fff5f5', color: '#c53030', borderRadius: 8, border: '1px solid #fed7d7' }}>
            {error}
          </div>
        )}

        {result && (
          <div className="ai-result" style={{ marginTop: 16 }}>
            <div className="ai-result-header">
              <span className="ai-badge">{(result.type || tool.id).replace(/-/g, ' ').toUpperCase()}</span>
            </div>
            {result.structured && renderStructured(result.structured)}
            {result.result && (
              <div
                className="ai-result-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(result.result) }}
              />
            )}
            {!result.structured && !result.result && (
              <pre style={{ background: '#f7fafc', borderRadius: 8, padding: 14, overflow: 'auto', fontSize: 13 }}>{JSON.stringify(result, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdvancedAITools;
