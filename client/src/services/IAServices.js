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

  /**
   * Generate child nodes using AI
   * @param {string} nodeText - Parent node text
   * @param {string} nodeTipo - Parent node type ('pregunta', 'respuesta', 'root')
   * @param {number} count - Number of nodes to generate
   * @returns {Promise<string[]>} Array of node texts
   */
  async generateNodes(nodeText, nodeTipo, count = 3) {
    try {
      const response = await this.apiClient.post('/api/mindmap/generate-nodes', {
        nodeText,
        nodeTipo,
        count
      });

      if (response.data.success && response.data.nodes) {
        return response.data.nodes.map(node => node.text);
      }

      // Fallback if response format unexpected
      console.warn('Unexpected API response, using mock data');
      return this.getMockResponses(nodeText);
    } catch (error) {
      console.error('IA generation failed:', error);

      // Show user-friendly error
      if (error.response?.status === 503) {
        console.warn('AI service unavailable, using mock responses');
      } else if (error.code === 'ECONNREFUSED') {
        console.warn('Cannot connect to server, using mock responses');
      }

      // Fallback to mock responses
      return this.getMockResponses(nodeText);
    }
  }

  /**
   * Mock responses for fallback
   */
  getMockResponses(question) {
    const lower = question.toLowerCase();

    if (lower.includes('ia') || lower.includes('inteligencia artificial')) {
      return [
        'Machine Learning',
        'Redes Neuronales',
        'Procesamiento de Lenguaje',
        'Visión por Computadora'
      ];
    }

    if (lower.includes('programación') || lower.includes('código')) {
      return [
        'Frontend',
        'Backend',
        'Base de Datos',
        'DevOps'
      ];
    }

    return [
      'Concepto 1',
      'Concepto 2',
      'Concepto 3'
    ];
  }
}

export default IAService;
