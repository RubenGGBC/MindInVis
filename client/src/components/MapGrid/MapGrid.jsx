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

import { useMapData } from '../../context/MapDataContext';

const iconMap = {
  Sparkles,
  Plus,
  BookOpen,
  FileText,
  Target,
  Briefcase,
  Brain,
  Lightbulb
};

const MapGrid = () => {
  const navigate = useNavigate();
  const { quickActions, templates } = useMapData();

  return (
    <div className="map-grid-container">
      <div className="section-header">
        <h2 className="section-title">Create new</h2>
      </div>

      <div className="bento-grid">
        {quickActions.map((action, index) => {
  const Icon = iconMap[action.icon];
  return (
    <button
      key={index}
      className={`bento-card ${action.size} ${action.color}`}
      onClick={() => {
        if (action.label === 'Blank map') {
          navigate('/editor');
        }
      }}
    >
      <div className="bento-content">
        <div className="bento-icon">
          <Icon size={action.size === 'large' ? 32 : 24} strokeWidth={2} />
        </div>
        <div className="bento-text">
          <h3 className="bento-label">{action.label}</h3>
          <p className="bento-description">{action.description}</p>
        </div>
        <ArrowRight className="bento-arrow" size={20} />
      </div>
    </button>
  );
})}
      </div>

      <div className="templates-section">
        <h3 className="templates-title">Quick templates</h3>
        <div className="templates-grid">
          {templates.map((template, index) => {
  const Icon = iconMap[template.icon];
  return (
    <button key={index} className={`template-chip ${template.color}`}>
      <Icon size={16} />
      <span>{template.label}</span>
    </button>
  );
})}
        </div>
      </div>
    </div>
  );
};

export default MapGrid;