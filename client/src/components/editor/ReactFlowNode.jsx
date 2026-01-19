import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { createPortal } from 'react-dom';
import './Node.css';
import NodeDetailsPopup from './NodeDetailsPopup';
import SummarizePopup from './SummarizePopup';
import NodeContextMenu from './NodeContextMenu';

// Funciones helper para colores por defecto
function getDefaultBackgroundColor(tipo) {
  switch(tipo) {
    case 'pregunta': return '#1e3a8a';
    case 'respuesta': return '#065f46';
    case 'root': return '#581c87';
    default: return '#0f1419';
  }
}

function getDefaultBorderColor(tipo) {
  switch(tipo) {
    case 'pregunta': return '#3b82f6';
    case 'respuesta': return '#10b981';
    case 'root': return '#8b5cf6';
    default: return '#8b5cf6';
  }
}

// Función para calcular el tamaño de fuente dinámicamente
function calculateFontSize(text, width, height) {
  const textLength = text.length;
  const containerArea = width * height;
  
  // Estimación: menos caracteres = fuente más grande
  // Máximo: 18px, Mínimo: 10px
  if (textLength <= 20) {
    return 16;
  } else if (textLength <= 50) {
    return 14;
  } else if (textLength <= 100) {
    return 12;
  } else {
    return 10;
  }
}

const ReactFlowNode = ({ data }) => {
  const { node, isEditing, onTextChange, onSubmit, isLoading, onNodeDoubleClick, onNodeClick, onAddChild, onToggleCollapse, onSummarize, onStyleChange, selected } = data;
  const [showPopup, setShowPopup] = useState(false);
  const [showSummarizePopup, setShowSummarizePopup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (onAddChild) {
      onAddChild(node);
    }
  };

  const handleToggleCollapse = (e) => {
    e.stopPropagation();
    if (onToggleCollapse) {
      onToggleCollapse(node);
    }
  };

  const handleTogglePopup = (e) => {
    e.stopPropagation();
    setShowPopup(!showPopup);
  };

  const handleToggleSummarizePopup = (e) => {
    e.stopPropagation();
    setShowSummarizePopup(!showSummarizePopup);
  };

  const handleSummarizeConfirm = (targetCount) => {
    if (onSummarize) {
      onSummarize(node, targetCount);
    }
    setShowSummarizePopup(false);
  };

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const handleMenuSummarize = () => {
    setShowSummarizePopup(true);
  };

  const width = node.width || 200;
  const height = node.height || 80;
  const fontSize = node.fontSize || calculateFontSize(node.text, width, height);

  const nodeStyle = {
    width: `${width}px`,
    height: `${height}px`,
    fontSize: `${fontSize}px`,
    backgroundColor: node.backgroundColor || getDefaultBackgroundColor(node.tipo),
    borderColor: node.borderColor || getDefaultBorderColor(node.tipo),
    borderWidth: `${node.borderWidth || 2}px`,
  };

  return (
    <>
    <div
      className={`mindmap-node ${selected ? 'selected' : ''} node-tipo-${node.tipo}`}
      style={nodeStyle}
      onDoubleClick={(e) => onNodeDoubleClick(e, node)}
      onClick={(e) => onNodeClick(e, node)}
    >
      <Handle type="target" position={Position.Left} />
      {isEditing ? (
        <div className="node-edit-mode">
          <input
            type="text"
            value={node.text}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question..."
            className="node-input"
            autoFocus
            disabled={isLoading}
          />
          {isLoading && (
            <div className="node-loading">
              <div className="spinner"></div>
              <span>Generating with AI...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="node-view-mode">
          <div className="node-content">
            {node.text}
          </div>
          <div className="node-action-buttons">
            {(node.description || node.source) && (
              <button
                className="node-action-btn"
                onClick={handleTogglePopup}
                title="Ver Descripción"
              >
                ℹ
              </button>
            )}
            {node.children && node.children.length > 0 && (
              <button
                className="node-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse(node);
                }}
                title={node.collapsed ? 'Mostrar Hijos' : 'Esconder Hijos'}
              >
                {node.collapsed ? '▶' : '▼'}
              </button>
            )}
            {node.children && node.children.length > 1 && onSummarize && (
              <button
                className="node-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSummarizePopup(true);
                }}
                title="Resumir Hijos"
              >
                ≡
              </button>
            )}
            <button
              className="node-action-btn node-menu-btn"
              onClick={handleToggleMenu}
              title="Opciones"
            >
              ⚙
            </button>
          </div>
        </div>
      )}
      {showPopup && (node.description || node.source) && (
        <NodeDetailsPopup
          node={node}
          onClose={() => setShowPopup(false)}
        />
      )}
      {showSummarizePopup && (
        <SummarizePopup
          node={node}
          onConfirm={handleSummarizeConfirm}
          onClose={() => setShowSummarizePopup(false)}
        />
      )}
      {showMenu && createPortal(
        <NodeContextMenu
          node={node}
          position={null}
          nodePosition={{ x: node.x, y: node.y }}
          onClose={handleCloseMenu}
          onStyleChange={onStyleChange}
          onSummarize={handleMenuSummarize}
          onToggleCollapse={onToggleCollapse}
        />,
        document.body
      )}
      <Handle type="source" position={Position.Right} />
    </div>
    </>
  );
};

export default React.memo(ReactFlowNode);
