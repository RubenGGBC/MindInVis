import React, { useState } from 'react';
import uploadService from '../services/UploadService';

const UploadExample = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle single file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadProgress(0);
  };

  // Handle multiple files selection
  const handleMultipleFilesChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
    setUploadProgress(0);
  };

  // Upload single file
  const handleSingleUpload = async () => {
    if (!selectedFile) {
      alert('Por favor selecciona un archivo');
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      const file = await uploadService.uploadSingleFile(
        selectedFile,
        (progress) => {
          setUploadProgress(progress);
          console.log(`Upload progress: ${progress}%`);
        }
      );

      setUploadedFile(file);
      alert('¡Archivo subido exitosamente!');
      console.log('Archivo subido:', file);

      // Resetear
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error al subir archivo:', error);
      alert('Error al subir el archivo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Upload multiple files
  const handleMultipleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Por favor selecciona al menos un archivo');
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      const files = await uploadService.uploadMultipleFiles(
        selectedFiles,
        (progress) => {
          setUploadProgress(progress);
          console.log(`Upload progress: ${progress}%`);
        }
      );

      alert(`¡${files.length} archivos subidos exitosamente!`);
      console.log('Archivos subidos:', files);

      // Resetear
      setSelectedFiles([]);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error al subir archivos:', error);
      alert('Error al subir los archivos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete uploaded file
  const handleDeleteFile = async (filename) => {
    if (!window.confirm('¿Estás seguro de eliminar este archivo?')) {
      return;
    }

    try {
      await uploadService.deleteFile(filename);
      setUploadedFile(null);
      alert('¡Archivo eliminado exitosamente!');
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      alert('Error al eliminar el archivo: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Ejemplo de Upload de Archivos</h2>

      {/* Single File Upload */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Subir un solo archivo</h3>
        <input
          type="file"
          onChange={handleFileChange}
          disabled={loading}
          style={{ marginBottom: '10px' }}
        />
        {selectedFile && (
          <p>Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>
        )}
        <button
          onClick={handleSingleUpload}
          disabled={loading || !selectedFile}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Subiendo...' : 'Subir Archivo'}
        </button>

        {loading && uploadProgress > 0 && (
          <div style={{ marginTop: '10px' }}>
            <progress value={uploadProgress} max="100" style={{ width: '100%' }} />
            <p>{uploadProgress}%</p>
          </div>
        )}
      </div>

      {/* Multiple Files Upload */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Subir múltiples archivos</h3>
        <input
          type="file"
          multiple
          onChange={handleMultipleFilesChange}
          disabled={loading}
          style={{ marginBottom: '10px' }}
        />
        {selectedFiles.length > 0 && (
          <div>
            <p>Archivos seleccionados: {selectedFiles.length}</p>
            <ul>
              {selectedFiles.map((file, index) => (
                <li key={index}>{file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={handleMultipleUpload}
          disabled={loading || selectedFiles.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Subiendo...' : 'Subir Archivos'}
        </button>

        {loading && uploadProgress > 0 && (
          <div style={{ marginTop: '10px' }}>
            <progress value={uploadProgress} max="100" style={{ width: '100%' }} />
            <p>{uploadProgress}%</p>
          </div>
        )}
      </div>

      {/* Uploaded File Info */}
      {uploadedFile && (
        <div style={{ padding: '20px', border: '1px solid #4CAF50', borderRadius: '8px', backgroundColor: '#f0f9ff' }}>
          <h3>Archivo Subido</h3>
          <p><strong>Nombre original:</strong> {uploadedFile.originalname}</p>
          <p><strong>Nombre en servidor:</strong> {uploadedFile.filename}</p>
          <p><strong>Tamaño:</strong> {(uploadedFile.size / 1024).toFixed(2)} KB</p>
          <p><strong>Tipo:</strong> {uploadedFile.mimetype}</p>
          <p><strong>URL:</strong> <a href={uploadService.getFileUrl(uploadedFile.filename)} target="_blank" rel="noopener noreferrer">Ver archivo</a></p>

          <button
            onClick={() => handleDeleteFile(uploadedFile.filename)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Eliminar Archivo
          </button>
        </div>
      )}

      {/* Usage Instructions */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fffbea', borderRadius: '8px' }}>
        <h4>Cómo usar en tu código:</h4>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`import uploadService from '../services/UploadService';

// Subir un archivo
const file = await uploadService.uploadSingleFile(
  fileObject,
  (progress) => console.log(progress)
);

// Subir múltiples archivos
const files = await uploadService.uploadMultipleFiles(
  filesArray,
  (progress) => console.log(progress)
);

// Eliminar un archivo
await uploadService.deleteFile(filename);

// Obtener URL del archivo
const url = uploadService.getFileUrl(filename);`}
        </pre>
      </div>
    </div>
  );
};

export default UploadExample;
