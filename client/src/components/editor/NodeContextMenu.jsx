import React, { useState, useEffect, useRef } from 'react';
import './NodeContextMenu.css';
import uploadService from '../../services/UploadService';

const NodeContextMenu = ({ node, position, nodePosition, onClose, onStyleChange, onSummarize, onToggleCollapse }) => {
  const menuRef = useRef(null);
  const pdfInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('style');
  const [uploading, setUploading] = useState(false);

  const [styles, setStyles] = useState({
    backgroundColor: node.backgroundColor,
    borderColor: node.borderColor,
    borderWidth: node.borderWidth || 2,
    width: node.width || 200,
    height: node.height || 80,
    fontSize: node.fontSize || 16
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleStyleChange = (property, value) => {
    const newStyles = { ...styles, [property]: value };
    setStyles(newStyles);
    if (onStyleChange) {
      onStyleChange(node, newStyles);
    }
  };

  const handleSummarize = () => {
    if (onSummarize) {
      onSummarize(node);
    }
    onClose();
  };

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse(node);
    }
    onClose();
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadService.uploadSingleFile(file);
      console.log('✅ PDF uploaded successfully:', result);
      if (pdfInputRef.current) {
        pdfInputRef.current.value = '';
      }
      onClose();
    } catch (error) {
      console.error('❌ Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const presetColors = {
    backgrounds: [
      '#1e3a8a',
      '#065f46',
      '#581c87',
      '#7c2d12',
      '#1e1b4b',
      '#831843',
      '#422006',
      '#0c4a6e'
    ],
    borders: [
      '#3b82f6',
      '#10b981',
      '#8b5cf6',
      '#f97316',
      '#6366f1',
      '#ec4899',
      '#fbbf24',
      '#06b6d4'
    ]
  };

  const menuStyle = {
    left: `${(nodePosition?.x || 0) + (node.width || 200) / 2 - 160}px`,
    top: `${(nodePosition?.y || 0) + (node.height || 80) + 10}px`
  };

  return (
    <div className="node-context-menu" style={menuStyle} ref={menuRef}>
      <div className="context-menu-header">
        <div className="context-menu-tabs">
          <button
            className={`tab-button ${activeTab === 'style' ? 'active' : ''}`}
            onClick={() => setActiveTab('style')}
          >
            Estilo
          </button>
          <button
            className={`tab-button ${activeTab === 'actions' ? 'active' : ''}`}
            onClick={() => setActiveTab('actions')}
          >
            Acciones
          </button>
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      {activeTab === 'style' && (
        <div className="context-menu-content">
          <div className="style-section">
            <label className="style-label">Color de Fondo</label>
            <div className="color-picker-container">
              <input
                type="color"
                value={styles.backgroundColor}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="color-input"
              />
              <div className="preset-colors">
                {presetColors.backgrounds.map((color) => (
                  <button
                    key={color}
                    className={`preset-color ${styles.backgroundColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleStyleChange('backgroundColor', color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="style-section">
            <label className="style-label">Color de Borde</label>
            <div className="color-picker-container">
              <input
                type="color"
                value={styles.borderColor}
                onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                className="color-input"
              />
              <div className="preset-colors">
                {presetColors.borders.map((color) => (
                  <button
                    key={color}
                    className={`preset-color ${styles.borderColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleStyleChange('borderColor', color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="style-section">
            <label className="style-label">
              Grosor del Borde: {styles.borderWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={styles.borderWidth}
              onChange={(e) => handleStyleChange('borderWidth', parseInt(e.target.value))}
              className="range-input"
            />
          </div>

          <div className="style-section">
            <label className="style-label">
              Ancho: {styles.width}px
            </label>
            <input
              type="range"
              min="150"
              max="400"
              step="10"
              value={styles.width}
              onChange={(e) => handleStyleChange('width', parseInt(e.target.value))}
              className="range-input"
            />
          </div>

          <div className="style-section">
            <label className="style-label">
              Alto: {styles.height}px
            </label>
            <input
              type="range"
              min="60"
              max="200"
              step="10"
              value={styles.height}
              onChange={(e) => handleStyleChange('height', parseInt(e.target.value))}
              className="range-input"
            />
          </div>

          <div className="style-section">
            <label className="style-label">
              Tamaño de Fuente: {styles.fontSize}px
            </label>
            <input
              type="range"
              min="10"
              max="24"
              value={styles.fontSize}
              onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
              className="range-input"
            />
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="context-menu-content">
          <div className="actions-section">
            {node.children && node.children.length > 0 && (
              <button
                className="action-button collapse-button"
                onClick={handleToggleCollapse}
              >
                <span className="action-icon">{node.collapsed ? '▶' : '▼'}</span>
                <span className="action-text">
                  {node.collapsed ? 'Mostrar Hijos' : 'Esconder Hijos'}
                </span>
              </button>
            )}

            {node.children && node.children.length > 1 && onSummarize && (
              <button
                className="action-button summarize-button"
                onClick={handleSummarize}
              >
                <span className="action-icon">≡</span>
                <span className="action-text">Resumir Nodos Hijos</span>
              </button>
            )}

            <label className="action-button pdf-button" htmlFor="pdf-upload">
              <span className="action-icon">📄</span>
              <span className="action-text">{uploading ? 'Subiendo...' : 'Subir PDF'}</span>
              <input
                ref={pdfInputRef}
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeContextMenu;
