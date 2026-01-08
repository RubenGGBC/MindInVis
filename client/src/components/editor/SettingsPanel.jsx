import { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import './SettingsPanel.css';

const SettingsPanel = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [nodeCount, setNodeCount] = useState(3);
  const [showApiKey, setShowApiKey] = useState(false);

  // Cargar configuración guardada
  useEffect(() => {
    const savedApiKey = localStorage.getItem('mindinvis_api_key') || '';
    const savedNodeCount = localStorage.getItem('mindinvis_node_count') || '3';
    setApiKey(savedApiKey);
    setNodeCount(parseInt(savedNodeCount));
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('mindinvis_api_key', apiKey);
    localStorage.setItem('mindinvis_node_count', nodeCount.toString());
    onClose();
  };

  const handleReset = () => {
    setApiKey('');
    setNodeCount(3);
    localStorage.removeItem('mindinvis_api_key');
    localStorage.removeItem('mindinvis_node_count');
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <div className="settings-title-group">
            <Settings size={24} />
            <h2>Configuración</h2>
          </div>
          <button className="settings-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-group">
            <label className="settings-label">API Key</label>
            <div className="settings-input-group">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingresa tu API key aquí..."
                className="settings-input"
              />
              <button
                className="settings-toggle-btn"
                onClick={() => setShowApiKey(!showApiKey)}
                title={showApiKey ? 'Ocultar' : 'Mostrar'}
              >
                {showApiKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="settings-help-text">
              Necesaria para generar nodos con IA. Obtenla de tu proveedor.
            </p>
          </div>

          <div className="settings-group">
            <label className="settings-label">Número de Nodos a Generar</label>
            <div className="settings-slider-group">
              <input
                type="range"
                min="1"
                max="10"
                value={nodeCount}
                onChange={(e) => setNodeCount(parseInt(e.target.value))}
                className="settings-slider"
              />
              <div className="settings-value-display">{nodeCount}</div>
            </div>
            <p className="settings-help-text">
              Cantidad de nodos que se generarán por cada nodo padre (1-10).
            </p>
          </div>

          <div className="settings-info-box">
            <h4>💡 Información</h4>
            <ul>
              <li>La API key se guarda localmente en tu navegador</li>
              <li>El número de nodos afecta a la generación automática</li>
              <li>Puedes cambiar estos valores en cualquier momento</li>
            </ul>
          </div>
        </div>

        <div className="settings-footer">
          <button className="settings-btn secondary" onClick={handleReset}>
            Restaurar Valores Predeterminados
          </button>
          <div className="settings-footer-actions">
            <button className="settings-btn secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="settings-btn primary" onClick={handleSave}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
