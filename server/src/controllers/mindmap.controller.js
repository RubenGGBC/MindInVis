import { validationResult } from 'express-validator';
import openaiService from '../services/openai.service.js';

export const generateNodes = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { nodeText, nodeTipo, count = 3 } = req.body;

    console.log(`\nPOST /api/mindmap/generate-nodes`);
    console.log(`   Input: nodeText="${nodeText}", nodeTipo="${nodeTipo}", count=${count}`);

    // Call OpenAI service
    const result = await openaiService.generateNodes(nodeText, nodeTipo, count);

    console.log(`Successfully generated ${result.nodes.length} nodes`);

    // Success response
    res.json({
      success: true,
      nodes: result.nodes,
      metadata: {
        model: 'gpt-3.5-turbo',
        count: result.nodes.length,
        tipo: nodeTipo
      }
    });
  } catch (error) {
    console.error('Controller error:', error.message);
    next(error);
  }
};

export const generateNodeDetail = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { nodeText, nodeTipo } = req.body;

    console.log(`\nPOST /api/mindmap/generate-detail`);
    console.log(`   Input: nodeText="${nodeText}", nodeTipo="${nodeTipo}"`);

    const nodeContext = {
      _styles: [
        { name: 'Number of items', value: 1 },
        { name: 'Description', value: 'are concise, clear and informative (maximum 3-4 sentences)' }
      ]
    };

    let question;
    if (nodeTipo === 'pregunta' || nodeTipo === 'root') {
      question = `Provide a brief explanation (3-4 sentences maximum) about: "${nodeText}". Focus on the main concept and its importance.`;
    } else {
      question = `Provide a brief explanation (3-4 sentences maximum) about: "${nodeText}". Explain what it means and why it matters.`;
    }

    const result = await openaiService.generateStructuredNodes(
      nodeContext,
      question,
      'basic',
      {}
    );

    console.log(`Successfully generated detail for node`);

    let description = '';

    if (result.parseError) {
      console.warn('Failed to parse JSON, using raw response');
      description = result.raw || 'Error al generar descripción';
    } else if (result.items && Array.isArray(result.items) && result.items.length > 0) {
      description = result.items[0].description || result.items[0].GPT_item_name || '';
    } else if (result.raw) {
      description = result.raw;
    } else {
      console.warn('Unexpected result structure:', result);
      description = 'No se pudo generar una descripción';
    }

    console.log('Description extracted:', description.substring(0, 100) + '...');

    res.json({
      success: true,
      description: description,
      metadata: {
        model: 'gpt-3.5-turbo',
        tipo: nodeTipo
      }
    });
  } catch (error) {
    console.error('Controller error generating detail:', error.message);
    next(error);
  }
};

export const aggregateNodes = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { question, nodes, clusterCount = 3 } = req.body;

    console.log(`\nPOST /api/mindmap/aggregate-nodes`);
    console.log(`   Question: "${question}"`);
    console.log(`   Nodes to cluster: ${nodes.length}, Clusters: ${clusterCount}`);

    const result = await openaiService.aggregateNodes(question, nodes, clusterCount);

    console.log(`Successfully aggregated nodes into clusters`);

    res.json({
      success: true,
      clusters: result.clusters || result,
      metadata: {
        model: 'gpt-3.5-turbo',
        nodesProcessed: nodes.length,
        clustersGenerated: clusterCount
      }
    });
  } catch (error) {
    console.error('Controller error aggregating nodes:', error.message);
    next(error);
  }
};
