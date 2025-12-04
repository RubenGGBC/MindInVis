import {
  Sparkles,
  Brain,
  Plus,
  BookOpen,
  Target,
  Briefcase,
  FileText,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MapGrid.css';

const MapGrid = () => {
  const navigate = useNavigate();
  const quickActions = [
    {
      icon: Sparkles,
      label: 'Crear con IA',
      description: 'Déjanos generar ideas por ti',
      color: 'primary',
      size: 'large'
    },
    {
      icon: Plus,
      label: 'Mapa en blanco',
      description: 'Empieza desde cero',
      color: 'secondary',
      size: 'medium'
    },
    {
      icon: BookOpen,
      label: 'De un tema',
      description: 'IA expande tus ideas',
      color: 'tertiary',
      size: 'medium'
    }
  ];

  const templates = [
    { icon: FileText, label: 'De un texto', color: 'green' },
    { icon: Target, label: 'Objetivos', color: 'pink' },
    { icon: Briefcase, label: 'Proyecto', color: 'orange' },
    { icon: Brain, label: 'Brainstorming', color: 'teal' },
    { icon: Lightbulb, label: 'Estudio', color: 'yellow' }
  ];

  return (
    <div className="map-grid-container">
      <div className="section-header">
        <h2 className="section-title">Crear nuevo</h2>
      </div>

      <div className="bento-grid">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className={`bento-card ${action.size} ${action.color}`}
            onClick={() => {
              if (action.label === 'Mapa en blanco') {
                navigate('/editor');
              }
            }}
          >
            <div className="bento-content">
              <div className="bento-icon">
                <action.icon size={action.size === 'large' ? 32 : 24} strokeWidth={2} />
              </div>
              <div className="bento-text">
                <h3 className="bento-label">{action.label}</h3>
                <p className="bento-description">{action.description}</p>
              </div>
              <ArrowRight className="bento-arrow" size={20} />
            </div>
          </button>
        ))}
      </div>

      <div className="templates-section">
        <h3 className="templates-title">Plantillas rápidas</h3>
        <div className="templates-grid">
          {templates.map((template, index) => (
            <button key={index} className={`template-chip ${template.color}`}>
              <template.icon size={16} />
              <span>{template.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapGrid;