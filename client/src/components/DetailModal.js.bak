import React from 'react';

function DetailModal({ title, item, fields, onClose, onEdit, onDelete }) {
  const formatValue = (field, value) => {
    if (value === null || value === undefined) return '—';
    if (field.type === 'checkbox') return value ? 'Yes' : 'No';
    if (field.type === 'select' && field.options) {
      const opt = field.options.find(o => o.value === value);
      return opt ? opt.label : value;
    }
    return String(value);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title} Details</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <label>ID</label>
              <span>{item.id}</span>
            </div>
            {fields.map(field => (
              <div key={field.key} className={`detail-item ${field.fullWidth ? 'full-width' : ''}`}>
                <label>{field.label}</label>
                {field.badge ? (
                  <span className={`badge badge-${item[field.key]}`}>{item[field.key] || '—'}</span>
                ) : (
                  <p>{formatValue(field, item[field.key])}</p>
                )}
              </div>
            ))}
            <div className="detail-item">
              <label>Created</label>
              <span>{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <label>Updated</label>
              <span>{new Date(item.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-danger" onClick={onDelete}>Delete</button>
          <button className="btn btn-primary" onClick={onEdit}>Edit</button>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default DetailModal;
