import { MoreHorizontal, Star, Sparkles, Clock, User } from 'lucide-react';
import './RecentMaps.css';

import { useMapData } from '../../context/MapDataContext';

const RecentMaps = () => {
  const { recentMaps } = useMapData();

  // Aquí podrías agregar lógica para actualizar, filtrar o manipular recentMaps si es necesario

  return (
    <div className="recent-maps-container">
      <div className="recent-maps-header">
        <h2 className="section-title">Recent</h2>
        <button className="view-all-btn">View all</button>
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
                  {map.nodes} nodes
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