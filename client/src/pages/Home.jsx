import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, Brain, Zap, Grid3x3, Layers, Share2 } from 'lucide-react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import MapGrid from '../components/MapGrid/MapGrid';
import RecentMaps from '../components/RecentMaps/RecentMaps';
import './Home.css';

const Home = ({ userName }) => {
  const navigate = useNavigate();
  const [showFlow, setShowFlow] = useState(false);

  // Sample flow data for demonstration
  const flowNodes = useMemo(() => [
    {
      id: '1',
      data: { label: 'Mind Mapping' },
      position: { x: 250, y: 10 },
      style: {
        background: '#6a4c93',
        color: '#fff',
        border: '2px solid #8b5fc8',
        borderRadius: '8px',
        padding: '10px 20px',
        fontWeight: 'bold',
        fontSize: '14px'
      }
    },
    {
      id: '2',
      data: { label: 'Visual Organization' },
      position: { x: 50, y: 150 },
      style: {
        background: '#4dd0e1',
        color: '#000',
        border: '2px solid #26c6da',
        borderRadius: '8px',
        padding: '10px 20px',
        fontWeight: 'bold',
        fontSize: '14px'
      }
    },
    {
      id: '3',
      data: { label: 'AI Generation' },
      position: { x: 250, y: 150 },
      style: {
        background: '#5c7bc8',
        color: '#fff',
        border: '2px solid #4a5fa5',
        borderRadius: '8px',
        padding: '10px 20px',
        fontWeight: 'bold',
        fontSize: '14px'
      }
    },
    {
      id: '4',
      data: { label: 'Collaboration' },
      position: { x: 450, y: 150 },
      style: {
        background: '#8b5fc8',
        color: '#fff',
        border: '2px solid #a78cd3',
        borderRadius: '8px',
        padding: '10px 20px',
        fontWeight: 'bold',
        fontSize: '14px'
      }
    },
    {
      id: '5',
      data: { label: 'Export & Share' },
      position: { x: 250, y: 290 },
      style: {
        background: '#2c3e87',
        color: '#fff',
        border: '2px solid #5c7bc8',
        borderRadius: '8px',
        padding: '10px 20px',
        fontWeight: 'bold',
        fontSize: '14px'
      }
    }
  ], []);

  const flowEdges = useMemo(() => [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#8b5fc8', strokeWidth: 2 } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#5c7bc8', strokeWidth: 2 } },
    { id: 'e1-4', source: '1', target: '4', animated: true, style: { stroke: '#8b5fc8', strokeWidth: 2 } },
    { id: 'e2-5', source: '2', target: '5', animated: true, style: { stroke: '#4dd0e1', strokeWidth: 2 } },
    { id: 'e3-5', source: '3', target: '5', animated: true, style: { stroke: '#5c7bc8', strokeWidth: 2 } },
    { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#8b5fc8', strokeWidth: 2 } },
  ], []);

  const [nodes] = useNodesState(flowNodes);
  const [edges] = useEdgesState(flowEdges);

  const features = [
    {
      icon: Grid3x3,
      title: 'Visual Canvas',
      description: 'Infinite canvas for organizing your thoughts with React Flow'
    },
    {
      icon: Brain,
      title: 'AI-Powered',
      description: 'Generate ideas, questions, and insights with LLM integration'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Instantly see changes as you explore and expand your mind maps'
    },
    {
      icon: Share2,
      title: 'Collaborate',
      description: 'Share your maps and work together seamlessly'
    },
    {
      icon: Layers,
      title: 'Deep Hierarchy',
      description: 'Unlimited levels of nested thoughts and connections'
    },
    {
      icon: Sparkles,
      title: 'Smart Context',
      description: 'AI understands your conversation flow for better suggestions'
    }
  ];

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Header userName={userName} />
        <div className="content-wrapper">
          {/* Hero Section with Flow Visualization */}
          <section className="hero-section">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">
                  Visualize Your Ideas
                  <br />
                  <span className="gradient-text">with React Flow</span>
                </h1>
                <p className="hero-subtitle">
                  Create beautiful mind maps powered by AI. Organize your thoughts, ask questions, and explore infinite possibilities.
                </p>
                <div className="hero-actions">
                  <button
                    className="primary-btn"
                    onClick={() => navigate('/editor')}
                  >
                    <Sparkles size={18} />
                    Start Creating
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => setShowFlow(!showFlow)}
                  >
                    <ArrowRight size={18} />
                    See How It Works
                  </button>
                </div>
              </div>

              {/* Flow Visualization Preview */}
              {showFlow && (
                <div className="flow-preview">
                  <div className="flow-container">
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      fitView
                    >
                      <Background />
                      <Controls />
                    </ReactFlow>
                  </div>
                  <div className="flow-overlay">
                    <button className="close-flow" onClick={() => setShowFlow(false)}>×</button>
                  </div>
                </div>
              )}
            </div>
          </section>


          {/* Create New Maps Section */}
          <MapGrid />
          {/* Recent Maps Section */}
          <RecentMaps />
        </div>
      </main>
    </div>
  );
};

export default Home;
