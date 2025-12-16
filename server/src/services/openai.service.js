import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import PromptBuilder from './PromptBuilder.js';

class OpenAIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not found in environment');
      throw new Error('OpenAI API key is required');
    }

    console.log('Initializing OpenAI service with gpt-3.5-turbo');
    this.llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 500,
      openAIApiKey: process.env.OPENAI_API_KEY
    });
    console.log('ChatOpenAI instance created');
  }

  async generateNodes(nodeText, nodeTipo, count = 3, useStructured = true, description = '') {
    try {
      console.log(`Generating ${count} nodes for "${nodeText}" (type: ${nodeTipo})`);

      // Siempre usar generación estructurada con PromptBuilder para obtener descripciones
      return this.generateNodesWithPromptBuilder(nodeText, nodeTipo, count, description);
    } catch (error) {
      console.error('OpenAI generation error:', error.message);
      console.error('Full error:', error);
      throw new Error(`Failed to generate nodes: ${error.message}`);
    }
  }

  async generateNodesWithPromptBuilder(nodeText, nodeTipo, count = 3, description = '') {
    try {
      console.log('Using PromptBuilder for node generation');
      console.log('Input:', { nodeText, nodeTipo, count, description });

      const nodeContext = {
        _styles: [
          { name: 'Number of items', value: count },
          { name: 'Description', value: description || 'are relevant and provide meaningful context' }
        ]
      };

      let question = nodeText;

      console.log('Calling generateStructuredNodes...');
      const result = await this.generateStructuredNodes(nodeContext, question, 'basic', {});
      console.log('Result from generateStructuredNodes:', JSON.stringify(result).substring(0, 300));

      const nodes = this._extractNodesFromStructuredResponse(result, count);
      console.log('Extracted nodes:', nodes.length, 'nodes');
      console.log('First node:', JSON.stringify(nodes[0]));

      return { nodes };
    } catch (error) {
      console.error('PromptBuilder generation error:', error);
      console.error('Stack:', error.stack);
      throw error;
    }
  }


  async aggregateNodes(question, nodes, clusterCount = 3) {
    try {
      console.log(`Aggregating ${nodes.length} nodes into ${clusterCount} clusters`);

      const formattedNodes = nodes.map(node => ({
        _info: {
          title: node.text || node.title || '',
          note: node.description || ''
        }
      }));

      const result = await this.generateStructuredNodes(
        null,
        question,
        'aggregation',
        { nodes: formattedNodes, clusterCount }
      );

      return result;
    } catch (error) {
      console.error('Aggregation error:', error);
      throw error;
    }
  }

  _extractNodesFromStructuredResponse(result, count) {
    const nodes = [];

    if (result.parseError) {
      console.warn('Failed to parse structured response, using fallback');
      console.warn('Parse error:', result.parseError);
      console.warn('Raw response:', result.raw?.substring(0, 200));
      for (let i = 0; i < count; i++) {
        nodes.push({
          text: `Concepto ${i + 1}`,
          description: 'Error al generar descripción',
          source: 'Fallback'
        });
      }
      return nodes;
    }

    // El PromptBuilder siempre usa "items" ahora
    if (result.items && Array.isArray(result.items)) {
      result.items.forEach((item, index) => {
        let text = item.GPT_item_name || item.item_name || '';
        let description = item.description || '';
        const excerpt = item.excerpt || '';

        console.log(`Item ${index}:`, JSON.stringify(item).substring(0, 150));

        // Si no hay GPT_item_name, buscar en las otras claves del objeto
        // OpenAI devuelve: {"item":"Developmental Stage", "description":"..."}
        // O: {"Global Temperature Rise":"...", "description":"..."}
        if (!text) {
          // Prioridad 1: buscar por claves conocidas genéricas
          if (item.item && typeof item.item === 'string') {
            text = item.item;
            console.log(`  Found as item.item: "${text}"`);
          } else if (item.name && typeof item.name === 'string') {
            text = item.name;
            console.log(`  Found as item.name: "${text}"`);
          } else {
            // Prioridad 2: tomar la primera propiedad que no sea 'description' o 'excerpt'
            for (const [key, value] of Object.entries(item)) {
              if (key !== 'description' && key !== 'excerpt' && typeof value === 'string') {
                // Esta es la clave del item (ej: "Global Temperature Rise")
                text = key;
                // Si el valor de esta key es la descripción, guardarla
                description = value;
                console.log(`  Found as key: "${text}" with description in value`);
                break;
              }
            }
          }
        }

        console.log(`  Text: "${text}", Description: "${description.substring(0, 50)}..."`);

        if (text) {
          const node = {
            text,
            description,
            source: excerpt ? 'PDF Extract' : 'OpenAI GPT-3.5'
          };
          if (excerpt) node.excerpt = excerpt;
          nodes.push(node);
        }
      });
    }

    while (nodes.length < count) {
      nodes.push({
        text: `Concepto ${nodes.length + 1}`,
        description: 'Descripción no disponible',
        source: 'Fallback'
      });
    }

    return nodes.slice(0, count);
  }

  _buildPrompt(nodeText, nodeTipo, count) {
    if (nodeTipo === 'pregunta' || nodeTipo === 'root') {
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

  _parseResponse(aiResponse) {
    if (!aiResponse || typeof aiResponse !== 'string') {
      return [];
    }

    const lines = aiResponse
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        return line.replace(/^[\d\-\*\•\.]+\s*/, '').trim();
      })
      .filter(line => line.length > 0);

    return lines.map(text => ({ text }));
  }

  async generateStructuredNodes(nodeContext, question, type = 'basic', options = {}) {
    try {
      console.log(`Generating structured nodes (type: ${type})`);

      let prompt;

      switch(type) {
        case 'basic':
          prompt = PromptBuilder.getPromptForLLMAnswers(nodeContext, question);
          break;
        case 'pdf':
          console.warn('PDF-based prompts require PDF upload functionality');
          prompt = PromptBuilder.getPromptForPDFAnswers(nodeContext, question);
          break;
        case 'aggregation':
          prompt = PromptBuilder.getPromptForSummarizationAnswers(
            question,
            options.nodes || [],
            options.clusterCount || 3
          );
          break;
        case 'summarization-questions':
          prompt = PromptBuilder.getPromptForSummarizationQuestions(
            question,
            options.nodes || [],
            options.clusterCount || 3
          );
          break;
        case 'suggested-model':
          prompt = PromptBuilder.getPromptForModelSuggestedQuestion(
            nodeContext,
            options.answerLabel,
            options.answerNote,
            options.previousQuestion,
            options.firstQuestion,
            options.model
          );
          break;
        case 'suggested-logs':
          prompt = PromptBuilder.getPromptForLogsSuggestedQuestions(
            nodeContext,
            options.answerLabel,
            options.answerNote,
            options.previousQuestion,
            options.firstQuestion,
            options.logs
          );
          break;
        case 'suggested-llm':
          prompt = PromptBuilder.getPromptForLLMSuggestedQuestions(
            nodeContext,
            options.answerLabel,
            options.answerNote,
            options.previousQuestion,
            options.firstQuestion
          );
          break;
        default:
          throw new Error(`Unknown type: ${type}`);
      }

      console.log('Advanced prompt built, invoking OpenAI...');
      console.log('Full prompt being sent to OpenAI:');
      console.log(prompt);
      console.log('---END OF PROMPT---');

      const messages = [
        new SystemMessage('You are an expert mind mapping assistant. Provide responses in valid JSON format.'),
        new HumanMessage(prompt)
      ];

      const response = await this.llm.invoke(messages);
      console.log('OpenAI response received, length:', response.content?.length);
      console.log('Response preview:', response.content?.substring(0, 300));

      const parsedResponse = this._parseStructuredResponse(response.content);
      console.log('Parsed structured response:', parsedResponse.parseError ? `ERROR: ${parsedResponse.parseError}` : 'SUCCESS');

      return parsedResponse;
    } catch (error) {
      console.error('OpenAI structured generation error:', error.message);
      console.error('Error details:', error);
      throw error;
    }
  }

  _parseStructuredResponse(aiResponse) {
    if (!aiResponse || typeof aiResponse !== 'string') {
      return { error: 'Invalid response' };
    }

    try {
      let jsonText = aiResponse;

      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      } else {
        const codeMatch = aiResponse.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
          jsonText = codeMatch[1];
        }
      }

      const parsed = JSON.parse(jsonText.trim());
      return parsed;
    } catch (error) {
      console.error('Failed to parse JSON response:', error.message);
      return {
        raw: aiResponse,
        parseError: error.message
      };
    }
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

  generateNodes(nodeText, nodeTipo, count, useStructured, description) {
    return this.getInstance().generateNodes(nodeText, nodeTipo, count, useStructured, description);
  }

  generateStructuredNodes(nodeContext, question, type, options) {
    return this.getInstance().generateStructuredNodes(nodeContext, question, type, options);
  }

  aggregateNodes(question, nodes, clusterCount) {
    return this.getInstance().aggregateNodes(question, nodes, clusterCount);
  }
}

export default new OpenAIServiceProxy();
