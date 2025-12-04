import './Node.css';

  const Node = ({ node, isEditing, onTextChange, onSubmit, isLoading }) => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmit();
      }
    };

    return (
      <div 
        className="mindmap-node"
        style={{
          position: 'absolute',
          left: `${node.x}px`,
          top: `${node.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
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