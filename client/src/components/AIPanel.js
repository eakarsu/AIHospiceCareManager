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
      if (err.response?.status === 429) {
        toast.error(err.response.data?.error || 'AI rate limit exceeded. Max 20 requests/hour.');
      } else {
        toast.error(err.response?.data?.error || 'AI request failed. Check your OpenRouter API key.');
      }
    }
    setAiLoading(false);
  };

  const renderMarkdown = (text) => {
    if (!text) return '';
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

    html = html.replace(/(<li>.*?<\/li>(\s*<br\/>)?)+/g, (match) => {
      return '<ul>' + match.replace(/<br\/>/g, '') + '</ul>';
    });

    return '<p>' + html + '</p>';
  };

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

  const communicationTypes = [
    { value: 'update', label: 'Status Update' },
    { value: 'transition', label: 'Transition of Care' },
    { value: 'symptom_change', label: 'Symptom Change Notification' },
    { value: 'condolence', label: 'Condolence Letter' },
    { value: 'bereavement_check', label: 'Bereavement Check-in' },
  ];

  const renderStructuredResult = (structured, type) => {
    if (!structured) return null;

    if (type === 'care-plan-narrative' && structured.key_priorities) {
      return (
        <div>
          {structured.narrative && (
            <div style={{ background: '#f8f4ff', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#553c9a', marginBottom: 8 }}>Narrative</div>
              <p style={{ color: '#2d3748', lineHeight: 1.6 }}>{structured.narrative}</p>
            </div>
          )}
          {structured.key_priorities?.length > 0 && (
            <div style={{ background: '#ebf8ff', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#2b6cb0', marginBottom: 8 }}>Key Priorities</div>
              <ul style={{ color: '#2d3748', paddingLeft: 20, margin: 0 }}>
                {structured.key_priorities.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
          {structured.family_message && (
            <div style={{ background: '#f0fff4', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#276749', marginBottom: 8 }}>Family Message</div>
              <p style={{ color: '#2d3748' }}>{structured.family_message}</p>
            </div>
          )}
          {structured.clinical_notes && (
            <div style={{ background: '#fffaf0', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#744210', marginBottom: 8 }}>Clinical Notes</div>
              <p style={{ color: '#2d3748' }}>{structured.clinical_notes}</p>
            </div>
          )}
        </div>
      );
    }

    if (type === 'symptom-recommendations' && structured.immediate_actions) {
      return (
        <div>
          {structured.immediate_actions?.length > 0 && (
            <div style={{ background: '#fff5f5', borderRadius: 8, padding: 16, marginBottom: 12, border: '1px solid #fed7d7' }}>
              <div style={{ fontWeight: 700, color: '#c53030', marginBottom: 8 }}>Immediate Actions</div>
              <ul style={{ color: '#2d3748', paddingLeft: 20, margin: 0 }}>
                {structured.immediate_actions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
          {structured.medication_adjustments?.length > 0 && (
            <div style={{ background: '#ebf8ff', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#2b6cb0', marginBottom: 8 }}>Medication Adjustments</div>
              <ul style={{ color: '#2d3748', paddingLeft: 20, margin: 0 }}>
                {structured.medication_adjustments.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}
          {structured.comfort_measures?.length > 0 && (
            <div style={{ background: '#f0fff4', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#276749', marginBottom: 8 }}>Comfort Measures</div>
              <ul style={{ color: '#2d3748', paddingLeft: 20, margin: 0 }}>
                {structured.comfort_measures.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
          {structured.escalation_triggers?.length > 0 && (
            <div style={{ background: '#fffaf0', borderRadius: 8, padding: 16, marginBottom: 12, border: '1px solid #fbd38d' }}>
              <div style={{ fontWeight: 700, color: '#744210', marginBottom: 8 }}>Escalation Triggers</div>
              <ul style={{ color: '#2d3748', paddingLeft: 20, margin: 0 }}>
                {structured.escalation_triggers.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (type === 'comfort-measures' && structured.pharmacological) {
      return (
        <div>
          {structured.pharmacological?.length > 0 && (
            <div style={{ background: '#ebf8ff', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#2b6cb0', marginBottom: 8 }}>Pharmacological</div>
              <ul style={{ color: '#2d3748', paddingLeft: 20, margin: 0 }}>
                {structured.pharmacological.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
          {structured.non_pharmacological?.length > 0 && (
            <div style={{ background: '#f0fff4', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#276749', marginBottom: 8 }}>Non-Pharmacological</div>
              <ul style={{ color: '#2d3748', paddingLeft: 20, margin: 0 }}>
                {structured.non_pharmacological.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}
          {structured.environment_modifications?.length > 0 && (
            <div style={{ background: '#fffaf0', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#744210', marginBottom: 8 }}>Environment Modifications</div>
              <ul style={{ color: '#2d3748', paddingLeft: 20, margin: 0 }}>
                {structured.environment_modifications.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          {structured.caregiver_guidance?.length > 0 && (
            <div style={{ background: '#f8f4ff', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#553c9a', marginBottom: 8 }}>Caregiver Guidance</div>
              <ul style={{ color: '#2d3748', paddingLeft: 20, margin: 0 }}>
                {structured.caregiver_guidance.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (type === 'predictive-decline' && structured) {
      const trajectoryColor = structured.decline_trajectory === 'rapid' ? '#c53030' : structured.decline_trajectory === 'moderate' ? '#c05621' : '#276749';
      return (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 12 }}>
            <div style={{ background: structured.still_eligible ? '#f0fff4' : '#fff5f5', borderRadius: 8, padding: 14, border: `1px solid ${structured.still_eligible ? '#9ae6b4' : '#fed7d7'}` }}>
              <div style={{ fontSize: 11, color: '#718096', textTransform: 'uppercase', marginBottom: 4 }}>Hospice Eligibility</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: structured.still_eligible ? '#276749' : '#c53030' }}>
                {structured.still_eligible ? 'Still Eligible' : 'May No Longer Qualify'}
              </div>
              {structured.eligibility_confidence && <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>Confidence: {structured.eligibility_confidence}</div>}
            </div>
            <div style={{ background: '#fffaf0', borderRadius: 8, padding: 14, border: '1px solid #fbd38d' }}>
              <div style={{ fontSize: 11, color: '#718096', textTransform: 'uppercase', marginBottom: 4 }}>Decline Trajectory</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: trajectoryColor, textTransform: 'capitalize' }}>{structured.decline_trajectory || '—'}</div>
              {structured.estimated_months_remaining !== undefined && (
                <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>Est. {structured.estimated_months_remaining} months remaining</div>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
            {[
              { label: 'GIP Need Indicated', val: structured.gip_need_indicated },
              { label: 'F2F Encounter Recommended', val: structured.f2f_encounter_recommended },
            ].map((item, i) => (
              <div key={i} style={{ background: '#f7fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontWeight: 700, color: item.val ? '#c53030' : '#276749' }}>{item.val ? 'Yes' : 'No'}</div>
              </div>
            ))}
            {structured.recommended_level_of_care && (
              <div style={{ background: '#ebf8ff', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>Recommended Care Level</div>
                <div style={{ fontWeight: 700, color: '#2b6cb0', fontSize: 12 }}>{structured.recommended_level_of_care}</div>
              </div>
            )}
          </div>
          {structured.key_clinical_indicators?.length > 0 && (
            <div style={{ background: '#ebf8ff', borderRadius: 8, padding: 14, marginBottom: 10 }}>
              <div style={{ fontWeight: 700, color: '#2b6cb0', marginBottom: 8 }}>Key Clinical Indicators</div>
              <ul style={{ paddingLeft: 18, margin: 0, color: '#2d3748', lineHeight: 1.8 }}>
                {structured.key_clinical_indicators.map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            </div>
          )}
          {structured.risk_flags?.length > 0 && (
            <div style={{ background: '#fff5f5', borderRadius: 8, padding: 14, marginBottom: 10, border: '1px solid #fed7d7' }}>
              <div style={{ fontWeight: 700, color: '#c53030', marginBottom: 8 }}>Risk Flags</div>
              <ul style={{ paddingLeft: 18, margin: 0, color: '#2d3748', lineHeight: 1.8 }}>
                {structured.risk_flags.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
          {structured.f2f_prep_notes && (
            <div style={{ background: '#f8f4ff', borderRadius: 8, padding: 14 }}>
              <div style={{ fontWeight: 700, color: '#553c9a', marginBottom: 8 }}>F2F Encounter Prep Notes</div>
              <p style={{ color: '#2d3748', margin: 0 }}>{structured.f2f_prep_notes}</p>
            </div>
          )}
        </div>
      );
    }

    if (type === 'bereavement-contact' && structured) {
      return (
        <div>
          <div style={{ background: '#ebf8ff', borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700, color: '#2b6cb0' }}>Contact Script — {structured.contact_method && <span style={{ fontSize: 13, fontWeight: 400 }}>via {structured.contact_method}</span>}</div>
              {structured.next_contact_month && (
                <div style={{ fontSize: 12, color: '#718096' }}>Next contact: Month {structured.next_contact_month}</div>
              )}
            </div>
            {structured.contact_script && (
              <div style={{ background: 'white', borderRadius: 6, padding: 12, fontSize: 14, color: '#2d3748', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {structured.contact_script}
              </div>
            )}
          </div>
          {structured.escalation_needed && (
            <div style={{ background: '#fff5f5', borderRadius: 8, padding: 14, marginBottom: 12, border: '1px solid #fed7d7' }}>
              <div style={{ fontWeight: 700, color: '#c53030', marginBottom: 6 }}>Escalation Required</div>
              <p style={{ margin: 0, color: '#2d3748' }}>{structured.escalation_reason}</p>
            </div>
          )}
          {structured.key_themes_for_month?.length > 0 && (
            <div style={{ background: '#f8f4ff', borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#553c9a', marginBottom: 8 }}>Key Themes for This Month</div>
              <ul style={{ paddingLeft: 18, margin: 0, color: '#2d3748', lineHeight: 1.8 }}>
                {structured.key_themes_for_month.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
          {structured.grief_stage_indicators?.length > 0 && (
            <div style={{ background: '#f0fff4', borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#276749', marginBottom: 8 }}>Grief Stage Indicators</div>
              <ul style={{ paddingLeft: 18, margin: 0, color: '#2d3748', lineHeight: 1.8 }}>
                {structured.grief_stage_indicators.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          )}
          {structured.resources_to_offer?.length > 0 && (
            <div style={{ background: '#fffaf0', borderRadius: 8, padding: 14 }}>
              <div style={{ fontWeight: 700, color: '#744210', marginBottom: 8 }}>Resources to Offer</div>
              <ul style={{ paddingLeft: 18, margin: 0, color: '#2d3748', lineHeight: 1.8 }}>
                {structured.resources_to_offer.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="ai-result" style={{ marginBottom: '24px' }}>
      {/* PHI Disclaimer Banner */}
      <div style={{
        background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 6,
        padding: '8px 14px', marginBottom: 14, fontSize: 13, color: '#856404',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontWeight: 700 }}>Clinical AI</span> — For internal care team use only. Do not share PHI outputs externally.
      </div>

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
          {aiLoading ? 'Generating...' : 'Generate'}
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

          {/* Structured output */}
          {aiResult.structured && renderStructuredResult(aiResult.structured, aiResult.type)}

          {/* Fallback to markdown rendering if no structured handler */}
          {(!aiResult.structured || !renderStructuredResult(aiResult.structured, aiResult.type)) && (
            <div
              className="ai-result-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(aiResult.result) }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default AIPanel;
