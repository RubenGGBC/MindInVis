import React, { useState } from 'react';
import './SummarizePopup.css';

const SummarizePopup = ({ node, onConfirm, onClose }) => {
  const childrenCount = node?.children?.length || 0;
  const [targetCount, setTargetCount] = useState(Math.max(2, Math.floor(childrenCount / 2)));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (targetCount >= 2 && targetCount < childrenCount) {
      onConfirm(targetCount);
    }
  };

  return (
    <div className="summarize-popup">
      <button className="popup-close" onClick={onClose}>×</button>
      <div className="popup-content">
        <h3 className="popup-title">Compactar Nodos Hijos</h3>
        <p className="popup-description">
          Este nodo tiene <strong>{childrenCount}</strong> hijos.
          Especifica en cuántos nodos deseas compactarlos:
        </p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="target-count">Número de nodos:</label>
            <input
              id="target-count"
              type="number"
              min="2"
              max={childrenCount - 1}
              value={targetCount}
              onChange={(e) => setTargetCount(parseInt(e.target.value))}
              autoFocus
            />
            <span className="input-hint">
              (Mínimo: 2, Máximo: {childrenCount - 1})
            </span>
          </div>
          <div className="popup-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={targetCount < 2 || targetCount >= childrenCount}
            >
              Compactar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SummarizePopup;
