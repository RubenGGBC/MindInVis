import { useState, useEffect } from 'react';
import { Settings, X, Palette } from 'lucide-react';
import './SettingsPanel.css';

const SettingsPanel = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [nodeCount, setNodeCount] = useState(3);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Colores predeterminados
  const [preguntaBgColor, setPreguntaBgColor] = useState('#1e3a8a');
  const [preguntaBorderColor, setPreguntaBorderColor] = useState('#3b82f6');
  const [respuestaBgColor, setRespuestaBgColor] = useState('#065f46');
  const [respuestaBorderColor, setRespuestaBorderColor] = useState('#10b981');

  // Cargar configuración guardada
  useEffect(() => {
    const savedApiKey = localStorage.getItem('mindinvis_api_key') || '';
    const savedNodeCount = localStorage.getItem('mindinvis_node_count') || '3';
    const savedPreguntaBg = localStorage.getItem('mindinvis_pregunta_bg') || '#1e3a8a';
    const savedPreguntaBorder = localStorage.getItem('mindinvis_pregunta_border') || '#3b82f6';
    const savedRespuestaBg = localStorage.getItem('mindinvis_respuesta_bg') || '#065f46';
    const savedRespuestaBorder = localStorage.getItem('mindinvis_respuesta_border') || '#10b981';
    
    setApiKey(savedApiKey);
    setNodeCount(parseInt(savedNodeCount));
    setPreguntaBgColor(savedPreguntaBg);
    setPreguntaBorderColor(savedPreguntaBorder);
    setRespuestaBgColor(savedRespuestaBg);
    setRespuestaBorderColor(savedRespuestaBorder);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('mindinvis_api_key', apiKey);
    localStorage.setItem('mindinvis_node_count', nodeCount.toString());
    localStorage.setItem('mindinvis_pregunta_bg', preguntaBgColor);
    localStorage.setItem('mindinvis_pregunta_border', preguntaBorderColor);
    localStorage.setItem('mindinvis_respuesta_bg', respuestaBgColor);
    localStorage.setItem('mindinvis_respuesta_border', respuestaBorderColor);
    
    // Disparar evento personalizado para que otros componentes sepan que cambió
    window.dispatchEvent(new Event('mindinvis-settings-updated'));
    
    onClose();
  };

  const handleReset = () => {
    setApiKey('');
    setNodeCount(3);
    setPreguntaBgColor('#1e3a8a');
    setPreguntaBorderColor('#3b82f6');
    setRespuestaBgColor('#065f46');
    setRespuestaBorderColor('#10b981');
    
    localStorage.removeItem('mindinvis_api_key');
    localStorage.removeItem('mindinvis_node_count');
    localStorage.removeItem('mindinvis_pregunta_bg');
    localStorage.removeItem('mindinvis_pregunta_border');
    localStorage.removeItem('mindinvis_respuesta_bg');
    localStorage.removeItem('mindinvis_respuesta_border');
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

          <div className="settings-divider"></div>

          <div className="settings-group">
            <label className="settings-label">
              <Palette size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Colores de Nodos: Preguntas
            </label>
            
            <div className="color-picker-group">
              <div className="color-picker-item">
                <label className="color-picker-label">Fondo</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    value={preguntaBgColor}
                    onChange={(e) => setPreguntaBgColor(e.target.value)}
                    className="color-picker-input"
                  />
                  <input
                    type="text"
                    value={preguntaBgColor}
                    onChange={(e) => setPreguntaBgColor(e.target.value)}
                    className="color-text-input"
                    placeholder="#1e3a8a"
                  />
                </div>
              </div>
              
              <div className="color-picker-item">
                <label className="color-picker-label">Borde</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    value={preguntaBorderColor}
                    onChange={(e) => setPreguntaBorderColor(e.target.value)}
                    className="color-picker-input"
                  />
                  <input
                    type="text"
                    value={preguntaBorderColor}
                    onChange={(e) => setPreguntaBorderColor(e.target.value)}
                    className="color-text-input"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">
              <Palette size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Colores de Nodos: Respuestas
            </label>
            
            <div className="color-picker-group">
              <div className="color-picker-item">
                <label className="color-picker-label">Fondo</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    value={respuestaBgColor}
                    onChange={(e) => setRespuestaBgColor(e.target.value)}
                    className="color-picker-input"
                  />
                  <input
                    type="text"
                    value={respuestaBgColor}
                    onChange={(e) => setRespuestaBgColor(e.target.value)}
                    className="color-text-input"
                    placeholder="#065f46"
                  />
                </div>
              </div>
              
              <div className="color-picker-item">
                <label className="color-picker-label">Borde</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    value={respuestaBorderColor}
                    onChange={(e) => setRespuestaBorderColor(e.target.value)}
                    className="color-picker-input"
                  />
                  <input
                    type="text"
                    value={respuestaBorderColor}
                    onChange={(e) => setRespuestaBorderColor(e.target.value)}
                    className="color-text-input"
                    placeholder="#10b981"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="settings-info-box">
            <h4>💡 Información</h4>
            <ul>
              <li>La API key se guarda localmente en tu navegador</li>
              <li>El número de nodos afecta a la generación automática</li>
              <li>Los colores se aplicarán a los nuevos nodos creados</li>
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
