import axios from 'axios';

class IAService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }


  async generateNodes(nodeText, nodeTipo, count = 3) {
    try {
      const response = await this.apiClient.post('/api/mindmap/generate-nodes', {
        nodeText,
        nodeTipo,
        count
      });

      if (response.data.success && response.data.nodes) {
        // Devolver objetos completos con texto, descripción y source
        return response.data.nodes.map(node => ({
          text: node.text,
          description: node.description || '',
          source: node.source || 'Generado por IA'
        }));
      }

      console.warn('Unexpected API response, using mock data');
      return this.getMockResponses(nodeText);
    } catch (error) {
      console.error('IA generation failed:', error);

      if (error.response?.status === 503) {
        console.warn('AI service unavailable, using mock responses');
      } else if (error.code === 'ECONNREFUSED') {
        console.warn('Cannot connect to server, using mock responses');
      }

      return this.getMockResponses(nodeText);
    }
  }

  async generateNodeDetail(nodeText, nodeTipo) {
    try {
      const response = await this.apiClient.post('/api/mindmap/generate-detail', {
        nodeText,
        nodeTipo
      });

      if (response.data.success && response.data.description) {
        return response.data.description;
      }

      console.warn('Unexpected API response for detail');
      return this.getMockDetail(nodeText, nodeTipo);
    } catch (error) {
      console.error('Detail generation failed:', error);

      if (error.response?.status === 503) {
        console.warn('AI service unavailable, using mock detail');
      } else if (error.code === 'ECONNREFUSED') {
        console.warn('Cannot connect to server, using mock detail');
      }

      return this.getMockDetail(nodeText, nodeTipo);
    }
  }

  getMockResponses(question) {
    const lower = question.toLowerCase();

    if (lower.includes('ia') || lower.includes('inteligencia artificial')) {
      return [
        { text: 'Machine Learning', description: 'Algoritmos que aprenden de datos', source: 'Mock data' },
        { text: 'Redes Neuronales', description: 'Modelos inspirados en el cerebro humano', source: 'Mock data' },
        { text: 'Procesamiento de Lenguaje', description: 'Comprensión y generación de texto', source: 'Mock data' },
        { text: 'Visión por Computadora', description: 'Análisis e interpretación de imágenes', source: 'Mock data' }
      ];
    }

    if (lower.includes('programación') || lower.includes('código')) {
      return [
        { text: 'Frontend', description: 'Desarrollo de interfaces de usuario', source: 'Mock data' },
        { text: 'Backend', description: 'Lógica del servidor y bases de datos', source: 'Mock data' },
        { text: 'Base de Datos', description: 'Almacenamiento y gestión de datos', source: 'Mock data' },
        { text: 'DevOps', description: 'Automatización y despliegue continuo', source: 'Mock data' }
      ];
    }

    return [
      { text: 'Concepto 1', description: 'Primera idea relacionada con el tema', source: 'Mock data' },
      { text: 'Concepto 2', description: 'Segunda perspectiva del concepto', source: 'Mock data' },
      { text: 'Concepto 3', description: 'Tercera aproximación al tema', source: 'Mock data' }
    ];
  }

  getMockDetail(nodeText, nodeTipo) {
    if (nodeTipo === 'pregunta' || nodeTipo === 'root') {
      return `Esta es una pregunta importante que requiere análisis profundo. El concepto "${nodeText}" involucra múltiples aspectos que deben ser considerados cuidadosamente para obtener una comprensión completa del tema.`;
    } else {
      return `El concepto "${nodeText}" es una respuesta clave que aborda aspectos fundamentales del tema. Su importancia radica en cómo conecta diferentes ideas y proporciona una perspectiva valiosa para la exploración del mapa mental.`;
    }
  }

  async aggregateNodes(question, nodes, clusterCount = 3) {
    try {
      console.log(`Aggregating ${nodes.length} nodes into ${clusterCount} clusters`);

      const response = await this.apiClient.post('/api/mindmap/aggregate-nodes', {
        question,
        nodes,
        clusterCount
      });

      if (response.data.success && response.data.clusters) {
        return response.data.clusters;
      }

      console.warn('Unexpected API response for aggregation, using mock data');
      return this.getMockClusters(nodes, clusterCount);
    } catch (error) {
      console.error('Node aggregation failed:', error);
      return this.getMockClusters(nodes, clusterCount);
    }
  }

  getMockClusters(nodes, clusterCount) {
    const clusters = [];
    const nodesPerCluster = Math.ceil(nodes.length / clusterCount);

    for (let i = 0; i < clusterCount; i++) {
      const start = i * nodesPerCluster;
      const end = Math.min(start + nodesPerCluster, nodes.length);
      const clusterNodes = nodes.slice(start, end);

      clusters.push({
        cluster_name: `Cluster ${i + 1}`,
        description: `Agrupación de nodos relacionados ${i + 1}`,
        clusteredItems: clusterNodes
      });
    }

    return clusters;
  }
}

export default IAService;
