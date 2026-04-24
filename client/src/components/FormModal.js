import React, { useState } from 'react';

function FormModal({ title, fields, initialData, onSubmit, onClose }) {
  const [formData, setFormData] = useState(() => {
    const data = {};
    fields.forEach(f => {
      data[f.key] = initialData[f.key] ?? f.defaultValue ?? '';
    });
    return data;
  });

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {fields.map(field => (
                <div key={field.key} className={`form-group ${field.fullWidth ? 'full-width' : ''}`}>
                  <label>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      required={field.required}
                    >
                      <option value="">Select...</option>
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                    />
                  ) : field.type === 'checkbox' ? (
                    <div style={{ paddingTop: '4px' }}>
                      <input
                        type="checkbox"
                        checked={!!formData[field.key]}
                        onChange={e => handleChange(field.key, e.target.checked)}
                        style={{ width: 'auto', marginRight: '8px' }}
                      />
                      <span style={{ fontSize: '14px' }}>{field.checkLabel || 'Yes'}</span>
                    </div>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={formData[field.key] || ''}
                      onChange={e => handleChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormModal;
