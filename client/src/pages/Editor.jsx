import { useState, useReducer, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sparkles, Save, Share2, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
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
import SettingsPanel from '../components/editor/SettingsPanel';
import MindMapNode from '../models/MindMapNode';
import IAService from '../services/IAServices';
import { mapService } from '../services/mapService';
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
  onSummarize,
  onStyleChange,
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
        onSummarize,
        onStyleChange,
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
  // pregunta → respuesta
  // respuesta → pregunta
  // (Nota: root no existe más, es ahora una pregunta)
  
  if (parentTipo === 'pregunta') {
    return 'respuesta';  // Questions generate answers (with context if depth >= 2)
  } else if (parentTipo === 'respuesta') {
    return 'pregunta';   // Answers generate questions (without context)
  }
  return 'respuesta'; // fallback
}

const Editor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mapId = location.state?.mapId;

  // Estado del editor con reducer
  const initialRootNode = useMemo(() =>
    new MindMapNode('root', 'Tema Central', 200, 400, 'pregunta'), []
  );
  const [state, dispatch] = useReducer(editorReducer, initialRootNode, getInitialState);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Estados UI
  const [mapName, setMapName] = useState('Untitled map');
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Estado para mostrar/ocultar sidebar
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const iaService = useMemo(() => new IAService(), []);

  // Load map from database if mapId exists
  useEffect(() => {
    const loadMap = async () => {
      if (!mapId) {
        console.log('No mapId provided, starting with blank map');
        return;
      }

      try {
        console.log('📂 Loading map with ID:', mapId);
        toast.loading('Loading map...', { id: 'load-map' });

        const mapData = await mapService.getMapById(mapId);
        console.log('📊 Map data received:', mapData);

        if (mapData.title) {
          setMapName(mapData.title);
        }

        // Check if we have a saved tree structure
        if (mapData.treeStructure) {
          console.log('🌳 Loading tree structure from database');

          // Recursively reconstruct MindMapNode objects from the saved tree
          const reconstructTree = (nodeData) => {
            if (!nodeData) return null;

            const node = new MindMapNode(
              nodeData.id,
              nodeData.text,
              nodeData.x || 200,
              nodeData.y || 400,
              nodeData.type || 'pregunta'
            );

            // Copy all properties
            node.width = nodeData.width || 200;
            node.height = nodeData.height || 80;
            node.fontSize = nodeData.fontSize || 16;
            // Preserve constructor defaults when server data omits colors
            node.backgroundColor = nodeData.backgroundColor || node.backgroundColor;
            node.borderColor = nodeData.borderColor || node.borderColor;
            node.borderWidth = nodeData.borderWidth || 2;
            node.description = nodeData.description || '';
            node.source = nodeData.source || '';
            node.collapsed = nodeData.collapsed || false;
            node.hasGeneratedChildren = nodeData.hasGeneratedChildren || false;

            // Recursively reconstruct children
            if (nodeData.children && Array.isArray(nodeData.children)) {
              node.children = nodeData.children.map(child => reconstructTree(child));
            } else {
              node.children = [];
            }

            return node;
          };

          const reconstructedTree = reconstructTree(mapData.treeStructure);

          if (reconstructedTree) {
            console.log('✅ Tree reconstructed successfully');
            dispatch(actionCreators.setTree(reconstructedTree));
            toast.success('Map loaded successfully!', { id: 'load-map' });
          } else {
            console.error('❌ Failed to reconstruct tree');
            toast.error('Failed to load map structure', { id: 'load-map' });
          }
        } else if (mapData.nodes && Array.isArray(mapData.nodes) && mapData.nodes.length > 0) {
          // Fallback: Load only root node if no tree structure is saved
          console.log('⚠️ No tree structure found, loading root node only');

          const rootNodeData = mapData.nodes.find(n => n.type === 'root' || n.type === 'pregunta');

          if (rootNodeData) {
            const rootNode = new MindMapNode(
              rootNodeData.id,
              rootNodeData.text,
              rootNodeData.x || 200,
              rootNodeData.y || 400,
              rootNodeData.type || 'pregunta'
            );

            // Copy properties
            rootNode.width = rootNodeData.width || 200;
            rootNode.height = rootNodeData.height || 80;
            rootNode.fontSize = rootNodeData.fontSize || 16;
            // Preserve constructor defaults when server data omits colors
            rootNode.backgroundColor = rootNodeData.backgroundColor || rootNode.backgroundColor;
            rootNode.borderColor = rootNodeData.borderColor || rootNode.borderColor;
            rootNode.borderWidth = rootNodeData.borderWidth || 2;
            rootNode.description = rootNodeData.description || '';
            rootNode.source = rootNodeData.source || '';
            rootNode.collapsed = rootNodeData.collapsed || false;
            rootNode.hasGeneratedChildren = rootNodeData.hasGeneratedChildren || false;
            rootNode.children = [];

            dispatch(actionCreators.setTree(rootNode));
            toast.success('Map loaded (root only)', { id: 'load-map' });
          } else {
            console.warn('⚠️ No root node found in map data');
            toast.error('Invalid map structure', { id: 'load-map' });
          }
        } else {
          console.log('ℹ️ Map has no nodes, starting fresh');
          toast.success('Map loaded (empty)', { id: 'load-map' });
        }
      } catch (error) {
        console.error('❌ Error loading map:', error);
        toast.error('Failed to load map', { id: 'load-map' });
      }
    };

    loadMap();
  }, [mapId, dispatch]);

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

  // Actualizar múltiples estilos del nodo
  const handleStyleChange = useCallback((node, styles) => {
    if (!node || !node.id) return;
    Object.entries(styles).forEach(([property, value]) => {
      dispatch(actionCreators.updateNodeProperty(node.id, property, value));
    });
  }, [dispatch]);

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
      alert('Cannot delete the root node');
      return;
    }

    dispatch(actionCreators.deleteNode(selectedNodeId));
    setSelectedNodeId(null);
  }, [selectedNode, selectedNodeId]);

  // Toggle colapsar/expandir nodo
  const handleToggleCollapse = useCallback((node) => {
    dispatch(actionCreators.toggleCollapse(node.id));
  }, []);

  // Compactar/resumir nodos hijos
  const handleSummarize = useCallback(async (parentNode, targetCount) => {
    if (!parentNode || !parentNode.children || parentNode.children.length <= 1) {
      toast.error('El nodo debe tener al menos 2 hijos para compactar');
      return;
    }

    if (targetCount < 2) {
      toast.error('Debes crear al menos 2 clusters');
      return;
    }

    if (targetCount >= parentNode.children.length) {
      toast.error('El número objetivo debe ser menor que el número de hijos actuales');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading(`🤖 Analizando ${parentNode.children.length} nodos con IA...`, { id: 'summarize' });

      // Preparar los nodos para la API
      const nodesToAggregate = parentNode.children.map(child => ({
        text: child.text,
        description: child.description || '',
        title: child.text
      }));

      toast.loading(`🔄 Compactando en ${targetCount} clusters...`, { id: 'summarize' });

      // Llamar a la API de agregación
      const clusters = await iaService.aggregateNodes(
        parentNode.text,
        nodesToAggregate,
        targetCount
      );

      console.log('Clusters received:', clusters);

      toast.loading('✨ Creando nuevos nodos...', { id: 'summarize' });

      // Calcular posiciones para los nuevos nodos
      const positions = calculateChildrenPositions(parentNode, clusters.length, state.tree);

      // Determinar el tipo de los hijos
      const childType = getChildTipo(parentNode.tipo);

      // Crear nuevos nodos a partir de los clusters
      const newChildren = clusters.map((cluster, index) => {
        const position = positions[index];
        const clusterText = cluster.cluster_name || `Cluster ${index + 1}`;
        const clusterDescription = cluster.description || '';

        // Crear descripción extendida que incluya los items agrupados
        const itemsList = cluster.clusteredItems?.map(item =>
          typeof item === 'string' ? item : (item.text || item.title || '')
        ).filter(Boolean).join(', ') || '';

        const fullDescription = itemsList
          ? `${clusterDescription}\n\nIncluye: ${itemsList}`
          : clusterDescription;

        const childNode = new MindMapNode(
          `node-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          clusterText,
          position.x,
          position.y,
          childType,
          fullDescription,
          'IA - Compactación'
        );
        return childNode;
      });

      // Reemplazar los hijos del nodo padre
      dispatch(actionCreators.replaceChildren(parentNode.id, newChildren));

      toast.success(`✅ ¡Compactación exitosa! ${parentNode.children.length} → ${targetCount} nodos`, {
        id: 'summarize',
        duration: 4000
      });
    } catch (error) {
      console.error('Error al compactar nodos:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      toast.error(`❌ Error al compactar: ${errorMessage}`, {
        id: 'summarize',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  }, [iaService, dispatch, state.tree]);

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
        const currentNode = findNodeById(state.tree, editingNodeId);
        
        console.log('📝 DEBUG currentNode:', {
          id: currentNode?.id,
          tipo: currentNode?.tipo,
          text: currentNode?.text,
          hasGeneratedChildren: currentNode?.hasGeneratedChildren
        });
        
        // Construir contexto del nodo SOLO PARA RESPUESTAS
        // Las RESPUESTAS generan PREGUNTAS CON CONTEXTO
        // Las PREGUNTAS generan RESPUESTAS SIN CONTEXTO
        let nodeContext = null;
        if (nodePath && currentNode && currentNode.tipo === 'respuesta') {
          const pathLength = nodePath.length;
          const rootNode = nodePath[0];
          const parentNode = pathLength > 1 ? nodePath[pathLength - 2] : null;
          
          nodeContext = {
            pathLength: pathLength,
            fullPath: nodePath.map(n => n.text),
            firstQuestion: rootNode?.text || '',
            previousQuestion: parentNode?.text || '',
            currentAnswer: editingText,
            currentAnswerNote: currentNode.description || ''
          };
          
          console.log('📍 CONTEXTO DETECTADO - Nodo tipo respuesta (generando preguntas):', {
            pathLength: nodeContext.pathLength,
            fullPath: nodeContext.fullPath,
            firstQuestion: nodeContext.firstQuestion,
            previousQuestion: nodeContext.previousQuestion,
            currentAnswer: nodeContext.currentAnswer
          });
        } else {
          console.log('⚪ No context needed - Generating answers from question (no context required)');
        }
        
        // Llamar a la API real con el tipo de nodo y contexto opcional
        // Enviar el TIPO DEL PADRE (no del hijo) para que el servidor sepa si usar contexto
        const nodeCount = parseInt(localStorage.getItem('mindinvis_node_count') || '3');
        const responses = await iaService.generateNodes(
          editingText,
          currentNode.tipo,  // TIPO DEL PADRE (pregunta o respuesta)
          nodeCount, // Cantidad de nodos a generar desde configuración
          nodeContext
        );

        const positions = calculateChildrenPositions(currentNode, responses.length, state.tree);

        // Calcular el tipo de los hijos
        const childType = getChildTipo(currentNode.tipo);

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
            childType,
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
        handleSummarize,
        handleStyleChange,
        handleTextChange,
        handleSubmit,
        isLoading,
        selectedNodeId
    );
    setNodes(nodes);
    setEdges(edges);
  }, [state.tree, editingNodeId, editingText, isLoading, setNodes, setEdges, handleNodeDoubleClick, handleNodeClick, handleAddChildToNode, handleToggleCollapse, handleSummarize, handleStyleChange, handleTextChange, handleSubmit, selectedNodeId]);

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

  // Función para guardar el mapa
  const handleSave = useCallback(async () => {
    if (!mapId) {
      toast.error('No map ID found. Cannot save.');
      return;
    }

    try {
      toast.loading('Saving map...', { id: 'save-map' });

      await mapService.saveMindMapState(mapId, {
        tree: state.tree,
        title: mapName
      });

      toast.success('Map saved successfully!', { id: 'save-map' });
    } catch (error) {
      console.error('Error saving map:', error);
      toast.error('Failed to save map. Please try again.', { id: 'save-map' });
    }
  }, [mapId, state.tree, mapName]);

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
          <button className="editor-btn secondary" onClick={handleSave}>
            <Save size={18} />
            Save
          </button>
          <button className="editor-btn secondary">
            <Share2 size={18} />
            Share
          </button>
          <button className="editor-btn primary" onClick={() => setIsSettingsOpen(true)}>
            <Settings size={18} />
            Settings
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

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

    </div>
  );
};

export default Editor;
