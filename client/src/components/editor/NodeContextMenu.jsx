import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import './NodeContextMenu.css';
import uploadService from '../../services/UploadService';
import LoadingOverlay from './LoadingOverlay';

const NodeContextMenu = ({ node, position, nodePosition, onClose, onStyleChange, onSummarize, onToggleCollapse }) => {
  const menuRef = useRef(null);
  const pdfInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('style');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [compacting, setCompacting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

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
    setCompacting(true);
    setLoadingMessage('🤖 Compacting nodes with AI...');
    toast.loading('🤖 Starting node compaction...', { id: 'compact' });
    if (onSummarize) {
      onSummarize(node);
    }
    setTimeout(() => {
      setCompacting(false);
      setLoadingMessage('');
      onClose();
    }, 1000);
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
    setUploadSuccess(false);
    setLoadingMessage(`📄 Uploading "${file.name}"...`);
    toast.loading(`📄 Uploading "${file.name}"...`, { id: 'upload-pdf' });
    
    try {
      const result = await uploadService.uploadSingleFile(file);
      console.log('✅ PDF uploaded successfully:', result);
      setUploadSuccess(true);
      setLoadingMessage('✅ PDF uploaded successfully');
      toast.success(`✅ PDF "${file.name}" uploaded successfully`, { 
        id: 'upload-pdf',
        duration: 3000 
      });
      
      if (pdfInputRef.current) {
        pdfInputRef.current.value = '';
      }
      setTimeout(() => {
        setUploadSuccess(false);
        setUploading(false);
        setLoadingMessage('');
        onClose();
      }, 1500);
    } catch (error) {
      console.error('❌ Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      toast.error(`❌ Error uploading PDF: ${errorMessage}`, { 
        id: 'upload-pdf',
        duration: 5000 
      });
      setUploading(false);
      setLoadingMessage('');
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
    left: `${(nodePosition?.x || 0) + (node.width || 200) + 10}px`,
    top: `${(nodePosition?.y || 0)}px`
  };

  return (
    <div className="node-context-menu" style={menuStyle} ref={menuRef}>
      <div className="context-menu-header">
        <div className="context-menu-tabs">
          <button
            className={`tab-button ${activeTab === 'style' ? 'active' : ''}`}
            onClick={() => setActiveTab('style')}
          >
            Style
          </button>
          <button
            className={`tab-button ${activeTab === 'actions' ? 'active' : ''}`}
            onClick={() => setActiveTab('actions')}
          >
            Actions
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
            <label className={`action-button pdf-button ${uploading ? 'uploading' : ''} ${uploadSuccess ? 'success' : ''}`} htmlFor="pdf-upload">
              <span className="action-icon">{uploadSuccess ? '✓' : '📄'}</span>
              <span className="action-text">
                {uploading ? 'Uploading...' : uploadSuccess ? 'PDF Uploaded!' : 'Upload PDF'}
              </span>
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

            <button
              className="action-button collapse-button"
              onClick={handleToggleCollapse}
              disabled={!node.children || node.children.length === 0}
            >
              <span className="action-icon">{node.collapsed ? '▶' : '▼'}</span>
              <span className="action-text">
                {node.collapsed ? 'Show Children' : 'Hide Children'}
              </span>
            </button>

            <button
              className={`action-button summarize-button ${compacting ? 'compacting' : ''}`}
              onClick={handleSummarize}
              disabled={!node.children || node.children.length <= 1 || !onSummarize || compacting}
            >
              <span className="action-icon">{compacting ? '⏳' : '≡'}</span>
              <span className="action-text">
                {compacting ? 'Compacting...' : 'Summarize Child Nodes'}
              </span>
            </button>
          </div>
        </div>
      )}
      <LoadingOverlay message={loadingMessage} show={uploading || compacting} />
    </div>
  );
};

export default NodeContextMenu;
