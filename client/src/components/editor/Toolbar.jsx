import { Plus, Trash2, LayoutGrid, Undo, Redo } from 'lucide-react';
import './Toolbar.css';

const Toolbar = ({
  selectedNode,
  onAddNode,
  onDeleteNode,
  onReorganize,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  return (
    <div className="toolbar-container">
      <div className="toolbar-group">
        <span className="toolbar-group-label">Nodes</span>
        <button
          className="toolbar-btn"
          onClick={onAddNode}
          title="Add child node"
          disabled={!selectedNode}
        >
          <Plus size={18} />
          <span>Add</span>
        </button>
        <button
          className="toolbar-btn delete"
          onClick={onDeleteNode}
          title="Delete node"
          disabled={!selectedNode}
        >
          <Trash2 size={18} />
          <span>Delete</span>
        </button>
        <button
          className="toolbar-btn"
          onClick={onReorganize}
          title="Reorganize nodes to initial positions"
        >
          <LayoutGrid size={18} />
          <span>Reorganize</span>
        </button>
      </div>
      <div className="toolbar-group">
        <span className="toolbar-group-label">History</span>
        <button
          className="toolbar-btn"
          onClick={onUndo}
          title="Undo"
          disabled={!canUndo}
        >
          <Undo size={18} />
          <span>Undo</span>
        </button>
        <button
          className="toolbar-btn"
          onClick={onRedo}
          title="Redo"
          disabled={!canRedo}
        >
          <Redo size={18} />
          <span>Redo</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
