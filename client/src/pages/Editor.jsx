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
import { findNodeById } from '../utils/nodeUtils';

const Editor = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Estado del editor con reducer
  const initialRootNode = useMemo(() =>
    new MindMapNode('root', 'Tema Central', 400, 300, 'root'), []
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

  const iaService = useMemo(() => new IAService(), []);

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

    const offsetX = (selectedNode.children?.length || 0) * 150;
    const newChild = selectedNode.createChild('Nuevo nodo', offsetX, 200, 'child');

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
    if (canvasRef.current) {
      canvasRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
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
      const spacing = 250;
      const startX = -((responses.length - 1) * spacing) / 2;

      const childrenNodes = responses.map((text, index) => {
        return editingNode.createChild(
          text,
          startX + (index * spacing),
          200,
          'child'
        );
      });

      dispatch(actionCreators.addChildren(editingNodeId, childrenNodes));
    }

    setEditingNodeId(null);
    setEditingText('');
  };

  const renderNodes = (node) => {
    const isSelected = selectedNode && selectedNode.id === node.id;
    return (
      <div key={node.id}>
        <div
          onClick={(e) => !draggingNode && handleNodeClick(e, node)}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMouseDown(e, node);
          }}
          style={{ position: 'relative', cursor: draggingNode === node.id ? 'grabbing' : 'grab' }}
        >
          <Node
            node={{...node, text: editingNodeId === node.id ? editingText : node.text}}
            isEditing={editingNodeId === node.id}
            isSelected={isSelected}
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
    setDraggingNode(node.id);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingNode) return;
    
    const rootnode = rootnodeRef.current;
    const updateNodePosition = (node) => {
      if (node.id === draggingNode) {
        node.x = e.clientX - dragOffset.x;
        node.y = e.clientY - dragOffset.y;
        return true;
      }
      if (node.children) {
        for (let child of node.children) {
          if (updateNodePosition(child)) return true;
        }
      }
      return false;
    };
    
    if (updateNodePosition(rootnode)) {
      setRender({});
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
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
        />
      </div>

      {/* Canvas */}
      <div
        className="editor-canvas"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {renderNodes(rootnodeRef.current)}
      </div>

      {/* Properties Panel */}
      <aside className="editor-sidebar">
        <h3 className="sidebar-title">Propiedades</h3>
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
    </div>
  );
};

export default Editor;
