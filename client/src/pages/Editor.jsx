import { useState, useReducer, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Save, Share2 } from 'lucide-react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';

import './Editor.css';
import Toolbar from '../components/editor/Toolbar';
import MindMapNode from '../models/MindMapNode';
import IAService from '../services/IAServices';
import { editorReducer, getInitialState, actionCreators } from '../reducers/editorReducer';
import { findNodeById, calculateChildrenPositions, findParentNode, getNodePath } from '../utils/nodeUtils';
import ReactFlowNode from '../components/editor/ReactFlowNode';

const nodeTypes = {
  custom: ReactFlowNode,
};

const treeToFlow = (
  node,
  editingNodeId,
  editingText,
  onNodeDoubleClick,
  onNodeClick,
  onAddChild,
  onToggleCollapse,
  onTextChange,
  onSubmit,
  isLoading,
  selectedNodeId
) => {
  const nodes = [];
  const edges = [];

  function traverse(node, parentId = null) {
    const isEditing = editingNodeId === node.id;
    nodes.push({
      id: node.id,
      type: 'custom',
      position: { x: node.x, y: node.y },
      data: {
        node: { ...node, text: isEditing ? editingText : node.text },
        isEditing,
        onTextChange,
        onSubmit,
        isLoading,
        onNodeDoubleClick,
        onNodeClick,
        onAddChild,
        onToggleCollapse,
        selected: node.id === selectedNodeId,
      },
    });

    if (parentId) {
      edges.push({
        id: `e${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        animated: true,
      });
    }

    if (node.children && !node.collapsed) {
      node.children.forEach(child => traverse(child, node.id));
    }
  }

  traverse(node);
  return { nodes, edges };
};

// Determina el tipo de hijo basado en el tipo del padre
function getChildTipo(parentTipo) {
  // root → respuesta (respuestas iniciales)
  // respuesta → pregunta (preguntas sobre la respuesta)
  // pregunta → respuesta (respuestas - CON CONTEXTO)
  
  if (parentTipo === 'root') {
    return 'respuesta';  // Root generates answers (tipo respuesta)
  } else if (parentTipo === 'respuesta') {
    return 'pregunta';   // Answers generate questions (tipo pregunta)
  } else if (parentTipo === 'pregunta') {
    return 'respuesta';  // Questions generate answers (tipo respuesta)
  }
  return 'respuesta'; // fallback
}

const Editor = () => {
  const navigate = useNavigate();

  // Estado del editor con reducer
  const initialRootNode = useMemo(() =>
    new MindMapNode('root', 'Tema Central', 200, 400, 'root'), []
  );
  const [state, dispatch] = useReducer(editorReducer, initialRootNode, getInitialState);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Estados UI
  const [mapName, setMapName] = useState('Mapa sin título');
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Estado para mostrar/ocultar sidebar
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const iaService = useMemo(() => new IAService(), []);

  // Detectar tecla Espacio para modo pan
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F9 para toggle sidebar
      if (e.key === 'F9') {
        e.preventDefault();
        setSidebarVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
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
  const handleNodeClick = useCallback((e, node) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedNodeId(node.id);
  }, []);

  // Manejador de doble clic: entrar en modo edición
  const handleNodeDoubleClick = useCallback((e, node) => {
    e.stopPropagation();
    setEditingNodeId(node.id);
    setEditingText(node.text);
    setSelectedNodeId(null); // Deseleccionar mientras editamos
  }, []);

  // Actualizar una propiedad del nodo
  const handlePropertyChange = useCallback((property, value) => {
    if (!selectedNodeId) return;

    dispatch(actionCreators.updateNodeProperty(selectedNodeId, property, value));
  }, [selectedNodeId]);

  const handleCanvasClick = useCallback(() => {
    setEditingNodeId(null);
    setSelectedNodeId(null);
  }, []);

  // Añadir un nodo hijo
  const handleAddNode = useCallback(() => {
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
      getChildTipo(selectedNode.tipo)
    );

    dispatch(actionCreators.addChild(selectedNodeId, newChild));
  }, [selectedNode, selectedNodeId]);

  const handleAddChildToNode = useCallback((parentNode) => {
    const verticalSpacing = 120;
    const horizontalOffset = 300;
    const childrenCount = parentNode.children?.length || 0;

    const offsetY = childrenCount * verticalSpacing;

    const newChild = new MindMapNode(
      `node-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      'Nuevo nodo',
      parentNode.x + horizontalOffset,
      parentNode.y + offsetY,
      getChildTipo(parentNode.tipo)
    );

    dispatch(actionCreators.addChild(parentNode.id, newChild));
  }, []);

  // Eliminar un nodo
  const handleDeleteNode = useCallback(() => {
    if (!selectedNode || selectedNode.id === 'root') {
      alert('No puedes eliminar el nodo raíz');
      return;
    }

    dispatch(actionCreators.deleteNode(selectedNodeId));
    setSelectedNodeId(null);
  }, [selectedNode, selectedNodeId]);

  // Toggle colapsar/expandir nodo
  const handleToggleCollapse = useCallback((node) => {
    dispatch(actionCreators.toggleCollapse(node.id));
  }, []);

  // Reorganizar todos los nodos a sus posiciones iniciales
  const handleReorganize = () => {
    dispatch(actionCreators.resetPositions());
  };

  const handleUndo = () => dispatch(actionCreators.undo());
  const handleRedo = () => dispatch(actionCreators.redo());

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  // Resetear la vista
  const handleResetView = () => {
    // React Flow's controls handle this
  };

  // Actualizar texto en edición
  const handleTextChange = useCallback((text) => {
    setEditingText(text);
  }, []);

  // Enviar cambios de texto y generar nodos hijos con IA
  const handleSubmit = useCallback(async () => {
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
      setIsLoading(true);

      try {
        // Obtener el path completo del nodo actual (para contexto)
        const nodePath = getNodePath(state.tree, editingNodeId);
        
        // Construir contexto del nodo SOLO PARA PREGUNTAS
        // Las preguntas generan respuestas CON CONTEXTO
        let nodeContext = null;
        if (nodePath && nodePath.length >= 2 && editingNode.tipo === 'pregunta') {
          const pathLength = nodePath.length;
          const rootNode = nodePath[0];
          const parentNode = nodePath[pathLength - 2];
          
          nodeContext = {
            pathLength: pathLength,
            fullPath: nodePath.map(n => n.text),
            firstQuestion: rootNode?.text || '',
            previousQuestion: parentNode?.text || '',
            currentAnswer: editingText,
            currentAnswerNote: editingNode.description || ''
          };
          
          console.log('📍 CONTEXTO DETECTADO - Nodo tipo pregunta:', {
            pathLength: nodeContext.pathLength,
            fullPath: nodeContext.fullPath,
            firstQuestion: nodeContext.firstQuestion,
            previousQuestion: nodeContext.previousQuestion,
            currentAnswer: nodeContext.currentAnswer
          });
        }
        
        // Llamar a la API real con el tipo de nodo y contexto opcional
        const responses = await iaService.generateNodes(
          editingText,
          editingNode.tipo,
          3, // Cantidad de nodos a generar
          nodeContext
        );

        const positions = calculateChildrenPositions(editingNode, responses.length, state.tree);

        const childrenNodes = responses.map((response, index) => {
          const position = positions[index];
          // Extraer texto y descripción de la respuesta
          const text = typeof response === 'string' ? response : (response.text || '');
          const description = typeof response === 'object' ? (response.description || '') : '';
          const source = typeof response === 'object' ? (response.source || 'Generado por IA') : 'Generado por IA';

          const childNode = new MindMapNode(
            `node-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            text,
            position.x,
            position.y,
            getChildTipo(editingNode.tipo),
            description,
            source
          );
          return childNode;
        });

        dispatch(actionCreators.addChildren(editingNodeId, childrenNodes));
      } catch (error) {
        console.error('Failed to generate nodes:', error);
        // El error ya está manejado por el fallback en IAService
      } finally {
        setIsLoading(false);
      }
    }

    setEditingNodeId(null);
    setEditingText('');
  }, [editingNodeId, editingText, state.tree, iaService, dispatch]);

  useEffect(() => {
    const { nodes, edges } = treeToFlow(
        state.tree,
        editingNodeId,
        editingText,
        handleNodeDoubleClick,
        handleNodeClick,
        handleAddChildToNode,
        handleToggleCollapse,
        handleTextChange,
        handleSubmit,
        isLoading,
        selectedNodeId // New parameter
    );
    setNodes(nodes);
    setEdges(edges);
  }, [state.tree, editingNodeId, editingText, isLoading, setNodes, setEdges, handleNodeDoubleClick, handleNodeClick, handleAddChildToNode, handleToggleCollapse, handleTextChange, handleSubmit, selectedNodeId]);

  const handleNodeDragStop = useCallback((event, draggedNode) => {
    const targetNode = nodes.find(
      (node) =>
        node.id !== draggedNode.id &&
        draggedNode.position.x < node.position.x + node.width &&
        draggedNode.position.x + draggedNode.width > node.position.x &&
        draggedNode.position.y < node.position.y + node.height &&
        draggedNode.position.y + draggedNode.height > node.position.y
    );

          if (targetNode) {
            // Check if they have roughly the same x coordinate for "same column"
            // Allowing for a small tolerance
            const xTolerance = 50; // pixels
            const areInSameColumn = Math.abs(draggedNode.position.x - targetNode.position.x) < xTolerance;
    
            if (areInSameColumn) {
              dispatch(actionCreators.swapNodes(draggedNode.id, targetNode.id));
              return;
            }
          }
    const originalNode = findNodeById(state.tree, draggedNode.id);
    if (originalNode) {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === draggedNode.id) {
            return { ...n, position: { x: originalNode.x, y: originalNode.y } };
          }
          return n;
        })
      );
    }
  }, [nodes, state.tree]);

  // Funciones de zoom
  const handleZoomIn = () => {
    // React Flow's controls handle this
  };

  const handleZoomOut = () => {
    // React Flow's controls handle this
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
          onReorganize={handleReorganize}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>

      {/* Canvas */}
      <div style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onClick={handleCanvasClick}
          onNodeDragStop={handleNodeDragStop}
          fitView
        >
          <Controls />
          <Background />
          <MiniMap nodeColor={n => n.data.node.backgroundColor} nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
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
