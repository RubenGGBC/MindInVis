import React from 'react';
import { Handle, Position } from 'reactflow';
import './Node.css';

const ReactFlowNode = ({ data }) => {
  const { node, isEditing, onTextChange, onSubmit, isLoading, onNodeDoubleClick, onNodeClick, onAddChild, onToggleCollapse, selected } = data;

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

  const nodeStyle = {
    width: `${node.width || 200}px`,
    height: `${node.height || 80}px`,
    fontSize: `${node.fontSize || 16}px`,
    backgroundColor: node.backgroundColor || '#0f1419',
    borderColor: node.borderColor || '#8b5cf6',
    borderWidth: `${node.borderWidth || 2}px`,
  };

  return (
    <div
      className={`mindmap-node ${selected ? 'selected' : ''}`}
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
      {!isEditing && onToggleCollapse && node.children && node.children.length > 0 && (
        <button
          className="node-collapse-button"
          onClick={handleToggleCollapse}
          title={node.collapsed ? "Expandir hijos" : "Colapsar hijos"}
        >
          {node.collapsed ? '▶' : '▼'}
        </button>
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
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default React.memo(ReactFlowNode);
