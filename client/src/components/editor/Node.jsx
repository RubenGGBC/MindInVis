import React from 'react';
import './Node.css';

const Node = ({ node, isEditing, isSelected, isDragging, onTextChange, onSubmit, isLoading, onAddChild, onToggleCollapse }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const containerStyle = {
    left: `${node.x}px`,
    top: `${node.y}px`,
    transform: 'translate(-50%, -50%)'
  };

  const nodeStyle = {
    width: `${node.width || 200}px`,
    height: `${node.height || 80}px`,
    fontSize: `${node.fontSize || 16}px`,
    backgroundColor: node.backgroundColor || '#0f1419',
    borderColor: node.borderColor || '#8b5cf6',
    borderWidth: `${node.borderWidth || 2}px`,
    boxShadow: isSelected ? '0 0 0 3px rgba(139, 92, 246, 0.4)' : undefined
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

  return (
    <div className="mindmap-node-container" style={containerStyle}>
      <div
        className={`mindmap-node ${isDragging ? 'dragging' : ''}`}
        style={nodeStyle}
      >
        {isEditing ? (
          <div className="node-edit-mode">
            <input
              type="text"
              value={node.text}
              onChange={(e) => onTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              className="node-input"
              autoFocus
              disabled={isLoading}
            />
            {isLoading && (
              <div className="node-loading">
                <div className="spinner"></div>
                <span>Generando con IA...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="node-view-mode">
            <div className="node-content">
              {node.text}
            </div>
          </div>
        )}
        {!isEditing && onAddChild && (
          <button
            className="node-add-button"
            onClick={handleAddClick}
            title="Agregar nodo hijo"
          >
            +
          </button>
        )}
        {!isEditing && onToggleCollapse && node.children && node.children.length > 0 && (
          <button
            className="node-collapse-button"
            onClick={handleToggleCollapse}
            title={node.collapsed ? "Expandir hijos" : "Colapsar hijos"}
          >
            {node.collapsed ? '▶' : '▼'}
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(Node);