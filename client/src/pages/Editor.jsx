import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Save, Share2, Download } from 'lucide-react';
import './Editor.css';
import Node from '../components/editor/Node';
import ConnectionLine from '../components/editor/ConnectionLine';
import MindMapNode from '../models/MindMapNode';
import IAService from '../services/IAServices';

const Editor = () => {
  const navigate = useNavigate();
  const [mapName, setMapName] = useState('Mapa sin título');
  const rootnodeRef = useRef(new MindMapNode('root', 'Tema Central', 400, 300, 'root'));
  const [, setRender] = useState({});
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const iaService = new IAService();

  const handleNodeClick = (e, node) => {
    if (e.button !== 0) return;
    setEditingNodeId(node.id);
    setEditingText(node.text);
  };

  const handleTextChange = (text) => {
    setEditingText(text);
  };

  const handleSubmit = () => {
    const rootnode = rootnodeRef.current;
    
    const findAndUpdateNode = (node) => {
      if (node.id === editingNodeId && editingText.trim()) {
        node.text = editingText;
        
        const responses = iaService.getMockResponses(editingText);
        const spacing = 250;
        const startX = -((responses.length - 1) * spacing) / 2;
        
        responses.forEach((text, index) => {
          node.addChild(text, startX + (index * spacing), 200, 'child');
        });
        
        return true;
      }
      
      if (node.children) {
        for (let child of node.children) {
          if (findAndUpdateNode(child)) return true;
        }
      }
      
      return false;
    };
    
    if (findAndUpdateNode(rootnode)) {
      setRender({});
    }
    
    setEditingNodeId(null);
    setEditingText('');
  };

  const renderNodes = (node) => {
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
        <div className="toolbar-section">
          <span className="toolbar-label">Herramientas</span>
          {/* Aquí irán las herramientas */}
        </div>
      </div>

      {/* Canvas */}
      <div 
        className="editor-canvas"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {renderNodes(rootnodeRef.current)}
      </div>

      {/* Properties Panel */}
      <aside className="editor-sidebar">
        <h3 className="sidebar-title">Propiedades</h3>
        <p className="sidebar-placeholder">Selecciona un nodo para ver sus propiedades</p>
      </aside>
    </div>
  );
};

export default Editor;
