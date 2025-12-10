import { Plus, Trash2, Circle, Square, ZoomIn, ZoomOut, Maximize2, LayoutGrid } from 'lucide-react';
import './Toolbar.css';

const Toolbar = ({ selectedNode, onAddNode, onDeleteNode, onResetView, onZoomIn, onZoomOut, zoom, onReorganize }) => {
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

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <span className="toolbar-group-label">Vista</span>
        <button
          className="toolbar-btn"
          onClick={onZoomOut}
          title="Alejar (Ctrl + Rueda arriba)"
          disabled={zoom <= 0.1}
        >
          <ZoomOut size={18} />
        </button>
        <span style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          minWidth: '50px',
          textAlign: 'center'
        }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          className="toolbar-btn"
          onClick={onZoomIn}
          title="Acercar (Ctrl + Rueda abajo)"
          disabled={zoom >= 3}
        >
          <ZoomIn size={18} />
        </button>
        <button
          className="toolbar-btn"
          onClick={onResetView}
          title="Resetear vista - Arrastra el fondo para mover el canvas"
        >
          <Maximize2 size={18} />
          <span>Resetear</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
