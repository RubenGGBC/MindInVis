import { useState, useReducer, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Save, Share2 } from 'lucide-react';
import './Editor.css';
import Node from '../components/editor/Node';
import ConnectionLine from '../components/editor/ConnectionLine';
import Toolbar from '../components/editor/Toolbar';
import MindMapNode from '../models/MindMapNode';
import IAService from '../services/IAServices';
import { editorReducer, getInitialState, actionCreators } from '../reducers/editorReducer';
import { findNodeById, calculateChildrenPositions } from '../utils/nodeUtils';

const Editor = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Estado del editor con reducer
  const initialRootNode = useMemo(() =>
    new MindMapNode('root', 'Tema Central', 200, 400, 'root'), []
  );
  const [state, dispatch] = useReducer(editorReducer, initialRootNode, getInitialState);

  // Estados UI
  const [mapName, setMapName] = useState('Mapa sin título');
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Estados para pan del canvas
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Estado para mostrar/ocultar sidebar
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const iaService = useMemo(() => new IAService(), []);
  const [spacePressed, setSpacePressed] = useState(false);

  // Detectar tecla Espacio para modo pan
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Espacio para pan
      if (e.code === 'Space' && !editingNodeId) {
        e.preventDefault();
        setSpacePressed(true);
      }

      // F9 para toggle sidebar
      if (e.key === 'F9') {
        e.preventDefault();
        setSidebarVisible(prev => !prev);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [editingNodeId]);

  // Obtener el nodo seleccionado actual del árbol
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return findNodeById(state.tree, selectedNodeId);
  }, [state.tree, selectedNodeId]);

  // Sincronizar nodeProperties con el nodo seleccionado
  const nodeProperties = useMemo(() => {
    if (!selectedNode) {
      return {
        width: 200,
        height: 80,
        fontSize: 16,
        backgroundColor: '#ffffff',
        borderColor: '#8b5cf6',
        borderWidth: 2
      };
    }
    return {
      width: selectedNode.width || 200,
      height: selectedNode.height || 80,
      fontSize: selectedNode.fontSize || 16,
      backgroundColor: selectedNode.backgroundColor || '#ffffff',
      borderColor: selectedNode.borderColor || '#8b5cf6',
      borderWidth: selectedNode.borderWidth || 2
    };
  }, [selectedNode]);

  // Manejador de clic simple: seleccionar nodo
  const handleNodeClick = (e, node) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    // Solo seleccionar si no estamos arrastrando
    if (!draggingNodeId) {
      setSelectedNodeId(node.id);
    }
  };

  // Manejador de doble clic: entrar en modo edición
  const handleNodeDoubleClick = (e, node) => {
    e.stopPropagation();
    setEditingNodeId(node.id);
    setEditingText(node.text);
    setSelectedNodeId(null); // Deseleccionar mientras editamos
  };

  // Actualizar una propiedad del nodo
  const handlePropertyChange = (property, value) => {
    if (!selectedNodeId) return;

    dispatch(actionCreators.updateNodeProperty(selectedNodeId, property, value));
  };

  // Deseleccionar al hacer clic en el canvas
  const handleCanvasClick = () => {
    if (!editingNodeId) {
      setSelectedNodeId(null);
    }
  };

  // Añadir un nodo hijo
  const handleAddNode = () => {
    if (!selectedNode) return;

    const verticalSpacing = 120;
    const horizontalOffset = 300;
    const childrenCount = selectedNode.children?.length || 0;

    // Calcular posición vertical basada en el número de hijos existentes
    const offsetY = childrenCount * verticalSpacing;

    const newChild = new MindMapNode(
      `node-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      'Nuevo nodo',
      selectedNode.x + horizontalOffset, // A la derecha
      selectedNode.y + offsetY, // Debajo del último hijo
      'child'
    );

    dispatch(actionCreators.addChild(selectedNodeId, newChild));
  };

  // Eliminar un nodo
  const handleDeleteNode = () => {
    if (!selectedNode || selectedNode.id === 'root') {
      alert('No puedes eliminar el nodo raíz');
      return;
    }

    dispatch(actionCreators.deleteNode(selectedNodeId));
    setSelectedNodeId(null);
  };

  // Resetear la vista
  const handleResetView = () => {
    setCanvasOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  // Actualizar texto en edición
  const handleTextChange = (text) => {
    setEditingText(text);
  };

  // Enviar cambios de texto y generar nodos hijos con IA
  const handleSubmit = () => {
    const editingNode = findNodeById(state.tree, editingNodeId);

    if (!editingNode || !editingText.trim()) {
      setEditingNodeId(null);
      setEditingText('');
      return;
    }

    // Actualizar el texto del nodo
    dispatch(actionCreators.updateNodeText(editingNodeId, editingText));

    // Generar nodos hijos SOLO si no se han generado antes
    if (!editingNode.hasGeneratedChildren) {
      const responses = iaService.getMockResponses(editingText);
      const positions = calculateChildrenPositions(editingNode, responses.length, state.tree);

      const childrenNodes = responses.map((text, index) => {
        const position = positions[index];
        const childNode = new MindMapNode(
          `node-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          text,
          position.x,
          position.y,
          'child'
        );
        return childNode;
      });

      dispatch(actionCreators.addChildren(editingNodeId, childrenNodes));
    }

    setEditingNodeId(null);
    setEditingText('');
  };

  const renderNodes = (node) => {
    const isSelected = selectedNode && selectedNode.id === node.id;
    const isDragging = draggingNodeId === node.id;

    return (
      <div key={node.id}>
        <div
          onClick={(e) => {
            if (!draggingNodeId) {
              handleNodeClick(e, node);
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleNodeDoubleClick(e, node);
          }}
          onMouseDown={(e) => {
            if (editingNodeId !== node.id) {
              e.stopPropagation();
              handleMouseDown(e, node);
            }
          }}
          style={{
            position: 'relative',
            cursor: isDragging ? 'grabbing' : 'pointer',
            zIndex: isDragging ? 1000 : 'auto'
          }}
        >
          <Node
            node={{...node, text: editingNodeId === node.id ? editingText : node.text}}
            isEditing={editingNodeId === node.id}
            isSelected={isSelected}
            isDragging={isDragging}
            onTextChange={handleTextChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
        {node.children && node.children.map((child) => (
          <div key={`connection-${child.id}`}>
            <ConnectionLine parentNode={node} childNode={child} />
            {renderNodes(child)}
          </div>
        ))}
      </div>
    );
  };

  const handleMouseDown = (e, node) => {
    if (editingNodeId !== null) return;
    e.preventDefault();
    e.stopPropagation();

    setDraggingNodeId(node.id);

    // Obtener el canvas y su posición
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();

    // Calcular el offset considerando zoom y pan
    const mouseX = (e.clientX - canvasRect.left - canvasOffset.x) / zoom;
    const mouseY = (e.clientY - canvasRect.top - canvasOffset.y) / zoom;

    const offsetX = mouseX - node.x;
    const offsetY = mouseY - node.y;

    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (e) => {
    // Manejar pan del canvas (con rueda/botón central o espacio + click)
    if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;

      setCanvasOffset({
        x: canvasOffset.x + deltaX,
        y: canvasOffset.y + deltaY
      });

      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Manejar drag de nodos
    if (draggingNodeId) {
      const canvas = canvasRef.current;
      const canvasRect = canvas.getBoundingClientRect();

      // Calcular nueva posición considerando zoom y offset del canvas
      const newX = (e.clientX - canvasRect.left - canvasOffset.x) / zoom - dragOffset.x;
      const newY = (e.clientY - canvasRect.top - canvasOffset.y) / zoom - dragOffset.y;

      dispatch(actionCreators.updateNodePosition(draggingNodeId, newX, newY));
    }
  };

  const handleMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      setDragOffset({ x: 0, y: 0 });
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  // Iniciar pan del canvas
  const handleCanvasMouseDown = (e) => {
    // Pan con botón central (rueda), Espacio + click izquierdo, o click directo en el fondo
    if (e.button === 1 || (e.button === 0 && spacePressed) || (e.button === 0 && e.target === e.currentTarget)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Zoom con la rueda del ratón
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(0.1, zoom * delta), 3);

      setZoom(newZoom);
    }
  };

  // Funciones de zoom
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev * 0.8, 0.1));
  };

  return (
    <div className="editor-container">
      {/* Header */}
      <header className="editor-header">
        <div className="editor-header-left">
          <button className="back-button" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
          </button>
          <input
            type="text"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            className="map-name-input"
          />
        </div>

        <div className="editor-header-right">
          <button className="editor-btn secondary">
            <Save size={18} />
            Guardar
          </button>
          <button className="editor-btn secondary">
            <Share2 size={18} />
            Compartir
          </button>
          <button className="editor-btn primary">
            <Sparkles size={18} />
            IA
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="editor-toolbar">
        <Toolbar
          selectedNode={selectedNode}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
          onResetView={handleResetView}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          zoom={zoom}
        />
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className={`editor-canvas ${draggingNodeId ? 'dragging' : ''} ${isPanning ? 'panning' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseDown={handleCanvasMouseDown}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        style={{
          cursor: isPanning ? 'grabbing' : (draggingNodeId ? 'grabbing' : (spacePressed ? 'grab' : 'default')),
          overflow: 'hidden'
        }}
      >
        <div
          onMouseDown={(e) => {
            // Si se hace clic directamente en este div (no en los nodos), activar pan
            if (e.target === e.currentTarget && e.button === 0) {
              e.preventDefault();
              setIsPanning(true);
              setPanStart({ x: e.clientX, y: e.clientY });
            }
          }}
          style={{
            position: 'relative',
            minWidth: '100%',
            minHeight: '100%',
            width: 'max-content',
            height: 'max-content',
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isPanning || draggingNodeId ? 'none' : 'transform 0.1s ease-out',
            cursor: isPanning ? 'grabbing' : 'grab'
          }}
        >
          {renderNodes(state.tree)}
        </div>
      </div>

      {/* Properties Panel */}
      <aside className={`editor-sidebar ${sidebarVisible ? 'visible' : 'hidden'}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">Propiedades</h3>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            title={sidebarVisible ? 'Ocultar propiedades (F9)' : 'Mostrar propiedades (F9)'}
          >
            {sidebarVisible ? '→' : '←'}
          </button>
        </div>

        {selectedNode ? (
          <div className="properties-panel">
            <div className="property-group">
              <label className="property-label">Ancho (px)</label>
              <input
                type="number"
                value={nodeProperties.width}
                onChange={(e) => handlePropertyChange('width', parseInt(e.target.value) || 200)}
                className="property-input"
                min="100"
                max="500"
              />
            </div>

            <div className="property-group">
              <label className="property-label">Alto (px)</label>
              <input
                type="number"
                value={nodeProperties.height}
                onChange={(e) => handlePropertyChange('height', parseInt(e.target.value) || 80)}
                className="property-input"
                min="50"
                max="300"
              />
            </div>

            <div className="property-group">
              <label className="property-label">Tamaño de fuente (px)</label>
              <input
                type="number"
                value={nodeProperties.fontSize}
                onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value) || 16)}
                className="property-input"
                min="10"
                max="32"
              />
            </div>

            <div className="property-group">
              <label className="property-label">Color de fondo</label>
              <input
                type="color"
                value={nodeProperties.backgroundColor}
                onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
                className="property-input-color"
              />
            </div>

            <div className="property-group">
              <label className="property-label">Color de borde</label>
              <input
                type="color"
                value={nodeProperties.borderColor}
                onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
                className="property-input-color"
              />
            </div>

            <div className="property-group">
              <label className="property-label">Grosor de borde (px)</label>
              <input
                type="number"
                value={nodeProperties.borderWidth}
                onChange={(e) => handlePropertyChange('borderWidth', parseInt(e.target.value) || 2)}
                className="property-input"
                min="0"
                max="10"
              />
            </div>
          </div>
        ) : (
          <p className="sidebar-placeholder">Haz clic en un nodo para ver sus propiedades</p>
        )}
      </aside>

      {/* Botón flotante para abrir sidebar cuando está oculto */}
      {!sidebarVisible && (
        <button
          className="sidebar-floating-btn"
          onClick={() => setSidebarVisible(true)}
          title="Mostrar propiedades (F9)"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            ← Propiedades
            <span style={{ fontSize: '11px', opacity: 0.6 }}>F9</span>
          </span>
        </button>
      )}
    </div>
  );
};

export default Editor;
