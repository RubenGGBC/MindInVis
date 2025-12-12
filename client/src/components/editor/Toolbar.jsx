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
        <span className="toolbar-group-label">Nodos</span>
        <button
          className="toolbar-btn"
          onClick={onAddNode}
          title="Añadir nodo hijo"
          disabled={!selectedNode}
        >
          <Plus size={18} />
          <span>Añadir</span>
        </button>
        <button
          className="toolbar-btn delete"
          onClick={onDeleteNode}
          title="Eliminar nodo"
          disabled={!selectedNode}
        >
          <Trash2 size={18} />
          <span>Eliminar</span>
        </button>
        <button
          className="toolbar-btn"
          onClick={onReorganize}
          title="Reorganizar nodos a posiciones iniciales"
        >
          <LayoutGrid size={18} />
          <span>Reorganizar</span>
        </button>
      </div>
      <div className="toolbar-group">
        <span className="toolbar-group-label">Historial</span>
        <button
          className="toolbar-btn"
          onClick={onUndo}
          title="Deshacer"
          disabled={!canUndo}
        >
          <Undo size={18} />
          <span>Deshacer</span>
        </button>
        <button
          className="toolbar-btn"
          onClick={onRedo}
          title="Rehacer"
          disabled={!canRedo}
        >
          <Redo size={18} />
          <span>Rehacer</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
