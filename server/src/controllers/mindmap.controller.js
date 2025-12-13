import { validationResult } from 'express-validator';
import geminiService from '../services/gemini.service.js';

/**
 * Generate child nodes using OpenAI
 */
export const generateNodes = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('⚠️  Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { nodeText, nodeTipo, count = 3 } = req.body;

    console.log(`\n📡 POST /api/mindmap/generate-nodes`);
    console.log(`   Input: nodeText="${nodeText}", nodeTipo="${nodeTipo}", count=${count}`);

    // Call Gemini service
    const result = await geminiService.generateNodes(nodeText, nodeTipo, count);

    console.log(`✓ Successfully generated ${result.nodes.length} nodes`);

    // Success response
    res.json({
      success: true,
      nodes: result.nodes,
      metadata: {
        model: 'gemini-pro',
        count: result.nodes.length,
        tipo: nodeTipo
      }
    });
  } catch (error) {
    console.error('❌ Controller error:', error.message);
    next(error);
  }
};
