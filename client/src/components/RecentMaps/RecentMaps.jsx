import { MoreHorizontal, Star, Sparkles, Clock, User } from 'lucide-react';
import './RecentMaps.css';

const RecentMaps = () => {
  const recentMaps = [
    {
      id: 1,
      name: 'Introducción a la IA',
      category: 'Aprendizaje',
      nodes: 24,
      createdBy: 'Ruben',
      modified: 'Hace 2 horas',
      starred: false,
      aiGenerated: true,
      color: 'cyan'
    },
    {
      id: 2,
      name: 'Plan de proyecto web',
      category: 'Trabajo',
      nodes: 32,
      createdBy: 'Ruben',
      modified: 'Ayer',
      starred: true,
      aiGenerated: false,
      color: 'purple'
    },
    {
      id: 3,
      name: 'Lluvia de ideas startup',
      category: 'Negocios',
      nodes: 18,
      createdBy: 'Ruben',
      modified: 'Hace 3 días',
      starred: false,
      aiGenerated: true,
      color: 'blue'
    },
    {
      id: 4,
      name: 'Objetivos 2025',
      category: 'Personal',
      nodes: 15,
      createdBy: 'Ruben',
      modified: 'Hace 1 semana',
      starred: true,
      aiGenerated: false,
      color: 'pink'
    },
  ];

  return (
    <div className="recent-maps-container">
      <div className="recent-maps-header">
        <h2 className="section-title">Recientes</h2>
        <button className="view-all-btn">Ver todos</button>
      </div>

      <div className="maps-grid">
        {recentMaps.map((map) => (
          <div key={map.id} className={`map-card ${map.color}`}>
            <div className="map-card-header">
              <div className="map-card-badges">
                {map.aiGenerated && (
                  <span className="ai-chip">
                    <Sparkles size={12} />
                  </span>
                )}
                <span className="category-chip">{map.category}</span>
              </div>
              <div className="map-card-actions">
                <button className={`star-action ${map.starred ? 'starred' : ''}`}>
                  <Star size={16} fill={map.starred ? 'currentColor' : 'none'} />
                </button>
                <button className="more-action">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            <div className="map-card-body">
              <h3 className="map-card-title">{map.name}</h3>
              <div className="map-card-meta">
                <span className="meta-item">
                  <span className="meta-dot"></span>
                  {map.nodes} nodos
                </span>
              </div>
            </div>

            <div className="map-card-footer">
              <div className="map-card-user">
                <User size={14} />
                <span>{map.createdBy}</span>
              </div>
              <div className="map-card-time">
                <Clock size={14} />
                <span>{map.modified}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentMaps;