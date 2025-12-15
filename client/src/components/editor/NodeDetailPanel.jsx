import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import IAService from '../../services/IAServices';
import './NodeDetailPanel.css';

const NodeDetailPanel = ({ node, onClose, onUpdateDescription }) => {
  const [description, setDescription] = useState(node?.description || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const iaService = new IAService();

  useEffect(() => {
    if (node) {
      setDescription(node.description || '');
      setError(null);
    }
  }, [node]);

  const handleGenerateDetail = async () => {
    if (!node) return;

    setIsGenerating(true);
    setError(null);

    try {
      const generatedDescription = await iaService.generateNodeDetail(node.text, node.tipo);
      setDescription(generatedDescription);

      if (onUpdateDescription) {
        onUpdateDescription(node.id, generatedDescription);
      }
    } catch (err) {
      console.error('Error generating detail:', err);
      setError('Error al generar detalle. Intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    setDescription(newDescription);

    if (onUpdateDescription) {
      onUpdateDescription(node.id, newDescription);
    }
  };

  if (!node) return null;

  return (
    <div className="node-detail-panel">
      <div className="panel-header">
        <h3>Detalles del Nodo</h3>
        <button className="close-button" onClick={onClose} title="Cerrar panel">
          <X size={20} />
        </button>
      </div>

      <div className="panel-content">
        <div className="node-info">
          <div className="info-row">
            <span className="label">Texto:</span>
            <span className="value">{node.text}</span>
          </div>
          <div className="info-row">
            <span className="label">Tipo:</span>
            <span className={`badge badge-${node.tipo}`}>{node.tipo}</span>
          </div>
        </div>

        <div className="description-section">
          <div className="section-header">
            <span className="label">Descripción Detallada</span>
            <button
              className="generate-button"
              onClick={handleGenerateDetail}
              disabled={isGenerating}
              title="Generar descripción con IA"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generar con IA</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <textarea
            className="description-textarea"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Agrega una descripción detallada del nodo o genera una con IA..."
            disabled={isGenerating}
          />
        </div>

        <div className="metadata-section">
          <h4>Metadatos</h4>
          <div className="metadata-grid">
            <div className="metadata-item">
              <span className="metadata-label">ID:</span>
              <span className="metadata-value">{node.id}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Creado:</span>
              <span className="metadata-value">
                {new Date(node.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Modificado:</span>
              <span className="metadata-value">
                {new Date(node.lastModified).toLocaleString()}
              </span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Hijos:</span>
              <span className="metadata-value">{node.children?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailPanel;
