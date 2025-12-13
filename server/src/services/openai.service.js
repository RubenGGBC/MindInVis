import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

class OpenAIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not found in environment');
      throw new Error('OpenAI API key is required');
    }
    
    console.log('✓ Initializing OpenAI service with gpt-3.5-turbo');
    this.llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 500,
      openAIApiKey: process.env.OPENAI_API_KEY
    });
    console.log('✓ ChatOpenAI instance created');
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
      console.log('📝 Prompt built, invoking LLM...');

      const response = await this.llm.invoke(prompt);
      console.log('✓ LLM response received');

      const nodes = this._parseResponse(response.content);
      console.log(`✓ Parsed ${nodes.length} nodes from response`);

      // Ensure we return exactly 'count' nodes (pad or trim as needed)
      const finalNodes = nodes.slice(0, count);
      while (finalNodes.length < count) {
        finalNodes.push({ text: `Concepto ${finalNodes.length + 1}` });
      }

      console.log(`✓ Returning ${finalNodes.length} final nodes`);
      return { nodes: finalNodes };
    } catch (error) {
      console.error('❌ OpenAI generation error:', error.message);
      console.error('Full error:', error);
      throw new Error(`Failed to generate nodes: ${error.message}`);
    }
  }

  /**
   * Build prompt based on node type
   * @private
   */
  _buildPrompt(nodeText, nodeTipo, count) {
    if (nodeTipo === 'pregunta' || nodeTipo === 'root') {
      // Generate ANSWERS for questions
      return [
        new SystemMessage('Eres un asistente de mind mapping que ayuda a explorar temas a través de pensamiento estructurado. Genera respuestas concisas y específicas.'),
        new HumanMessage(`Genera ${count} respuestas concisas y distintas a la siguiente pregunta:

"${nodeText}"

Requisitos:
- Cada respuesta debe tener máximo 5-15 palabras
- Las respuestas deben explorar diferentes aspectos o perspectivas
- Hazlas específicas y accionables
- Devuelve SOLO las respuestas, una por línea, sin numeración ni viñetas
- Usa español si la pregunta está en español, inglés si está en inglés

Formato: Una respuesta por línea`)
      ];
    } else if (nodeTipo === 'respuesta') {
      // Generate QUESTIONS for answers
      return [
        new SystemMessage('Eres un asistente de mind mapping que ayuda a profundizar la exploración mediante preguntas. Genera preguntas provocadoras de seguimiento.'),
        new HumanMessage(`Basándote en la siguiente afirmación o respuesta:

"${nodeText}"

Genera ${count} preguntas de seguimiento que exploren este tema más profundamente.

Requisitos:
- Cada pregunta debe tener máximo 5-15 palabras
- Las preguntas deben explorar diferentes ángulos (por qué, cómo, qué pasaría si, consecuencias, etc.)
- Hazlas provocadoras y específicas
- Devuelve SOLO las preguntas, una por línea, sin numeración ni viñetas
- Usa español si la afirmación está en español, inglés si está en inglés

Formato: Una pregunta por línea`)
      ];
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

class OpenAIServiceProxy {
  constructor() {
    this.serviceInstance = null;
  }

  getInstance() {
    if (!this.serviceInstance) {
      this.serviceInstance = new OpenAIService();
    }
    return this.serviceInstance;
  }

  generateNodes(nodeText, nodeTipo, count) {
    return this.getInstance().generateNodes(nodeText, nodeTipo, count);
  }
}

export default new OpenAIServiceProxy();
