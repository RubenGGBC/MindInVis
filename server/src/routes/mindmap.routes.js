import express from 'express';
import { generateNodes } from '../controllers/mindmap.controller.js';
import { validateGenerateNodes } from '../middleware/validate.js';

const router = express.Router();

// POST /api/mindmap/generate-nodes
router.post('/generate-nodes', validateGenerateNodes, generateNodes);

export default router;
