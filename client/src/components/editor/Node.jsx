import './Node.css';

  const Node = ({ node, isEditing, isSelected, onTextChange, onSubmit, isLoading }) => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmit();
      }
    };

    const nodeStyle = {
      position: 'absolute',
      left: `${node.x}px`,
      top: `${node.y}px`,
      transform: 'translate(-50%, -50%)',
      width: `${node.width || 200}px`,
      height: `${node.height || 80}px`,
      fontSize: `${node.fontSize || 16}px`,
      backgroundColor: node.backgroundColor || '#ffffff',
      borderColor: node.borderColor || '#8b5cf6',
      borderWidth: `${node.borderWidth || 2}px`,
      boxShadow: isSelected ? '0 0 0 3px rgba(139, 92, 246, 0.4)' : undefined
    };

    return (
      <div
        className="mindmap-node"
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
      </div>
    );
  };
  export default Node;