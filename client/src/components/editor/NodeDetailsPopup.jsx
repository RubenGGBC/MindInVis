import React from 'react';
import './NodeDetailsPopup.css';

const NodeDetailsPopup = ({ node, onClose }) => {
  if (!node) return null;

  const description = node.description || 'Sin descripción disponible';
  const source = node.source || 'Generado por IA';

  return (
    <div className="node-tooltip">
      <button className="tooltip-close" onClick={onClose}>×</button>
      <div className="tooltip-content">
        <p className="tooltip-description">{description}</p>
        <div className="tooltip-source">
          <span className="source-label">Fuente:</span>
          <span className="source-value">{source}</span>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsPopup;
