import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment');
      throw new Error('Gemini API key is required');
    }
    
    console.log('✓ Initializing Gemini service with gemini-2.5-flash');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('✓ Gemini instance created');
  }

  /**
   * Generate child nodes based on parent node content and type
   * @param {string} nodeText - Content of the parent node
   * @param {string} nodeTipo - Type of parent node ('pregunta', 'respuesta', 'root')
   * @param {number} count - Number of nodes to generate (default: 3)
   * @returns {Promise<{nodes: Array<{text: string}>}>}
   */
  async generateNodes(nodeText, nodeTipo, count = 3) {
    try {
      console.log(`🤖 Generating ${count} nodes for "${nodeText}" (type: ${nodeTipo})`);
      
      const prompt = this._buildPrompt(nodeText, nodeTipo, count);
      console.log('📝 Prompt built, invoking Gemini...');

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      if (!response) {
        throw new Error('No response from Gemini');
      }
      
      const text = response.text();
      console.log('✓ Gemini response received, text length:', text.length);

      const nodes = this._parseResponse(text);
      console.log(`✓ Parsed ${nodes.length} nodes from response`);

      // Ensure we return exactly 'count' nodes (pad or trim as needed)
      const finalNodes = nodes.slice(0, count);
      while (finalNodes.length < count) {
        finalNodes.push({ text: `Concepto ${finalNodes.length + 1}` });
      }

      console.log(`✓ Returning ${finalNodes.length} final nodes`);
      return { nodes: finalNodes };
    } catch (error) {
      console.error('❌ Gemini generation error:', error.message);
      console.error('Error details:', error);
      
      // Return fallback nodes instead of throwing
      console.warn('⚠️  Using fallback nodes');
      const fallbackNodes = [];
      for (let i = 1; i <= count; i++) {
        fallbackNodes.push({ text: `Concepto ${i}` });
      }
      return { nodes: fallbackNodes };
    }
  }

  /**
   * Build prompt based on node type
   * @private
   */
  _buildPrompt(nodeText, nodeTipo, count) {
    if (nodeTipo === 'pregunta' || nodeTipo === 'root') {
      // Generate ANSWERS for questions
      return `Eres un asistente de mind mapping que ayuda a explorar temas a través de pensamiento estructurado. Genera respuestas concisas y específicas.

Genera ${count} respuestas concisas y distintas a la siguiente pregunta:

"${nodeText}"

Requisitos:
- Cada respuesta debe tener máximo 5-15 palabras
- Las respuestas deben explorar diferentes aspectos o perspectivas
- Hazlas específicas y accionables
- Devuelve SOLO las respuestas, una por línea, sin numeración ni viñetas
- Usa español si la pregunta está en español, inglés si está en inglés

Formato: Una respuesta por línea`;
    } else if (nodeTipo === 'respuesta') {
      // Generate QUESTIONS for answers
      return `Eres un asistente de mind mapping que ayuda a profundizar la exploración mediante preguntas. Genera preguntas provocadoras de seguimiento.

Basándote en la siguiente afirmación o respuesta:

"${nodeText}"

Genera ${count} preguntas de seguimiento que exploren este tema más profundamente.

Requisitos:
- Cada pregunta debe tener máximo 5-15 palabras
- Las preguntas deben explorar diferentes ángulos (por qué, cómo, qué pasaría si, consecuencias, etc.)
- Hazlas provocadoras y específicas
- Devuelve SOLO las preguntas, una por línea, sin numeración ni viñetas
- Usa español si la afirmación está en español, inglés si está en inglés

Formato: Una pregunta por línea`;
    } else {
      throw new Error(`Unknown node type: ${nodeTipo}`);
    }
  }

  /**
   * Parse LLM response into array of node objects
   * @private
   */
  _parseResponse(aiResponse) {
    if (!aiResponse || typeof aiResponse !== 'string') {
      return [];
    }

    // Split by newlines and clean up
    const lines = aiResponse
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Remove common prefixes (1., -, *, •, etc.)
        return line.replace(/^[\d\-\*\•\.]+\s*/, '').trim();
      })
      .filter(line => line.length > 0);

    return lines.map(text => ({ text }));
  }
}

let instance = null;

class GeminiServiceProxy {
  constructor() {
    this.serviceInstance = null;
  }

  getInstance() {
    if (!this.serviceInstance) {
      this.serviceInstance = new GeminiService();
    }
    return this.serviceInstance;
  }

  generateNodes(nodeText, nodeTipo, count) {
    return this.getInstance().generateNodes(nodeText, nodeTipo, count);
  }
}

export default new GeminiServiceProxy();
