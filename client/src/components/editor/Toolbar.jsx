import { Plus, Trash2, Circle, Square, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import './Toolbar.css';

const Toolbar = ({ selectedNode, onAddNode, onDeleteNode, onResetView }) => {
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
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <span className="toolbar-group-label">Vista</span>
        <button
          className="toolbar-btn"
          onClick={() => onResetView?.()}
          title="Centrar vista"
        >
          <Maximize2 size={18} />
          <span>Centrar</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
