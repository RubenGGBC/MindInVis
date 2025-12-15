import express from 'express';
import {
  generateNodes,
  generateNodeDetail,
  aggregateNodes
} from '../controllers/mindmap.controller.js';
import {
  validateGenerateNodes,
  validateGenerateDetail,
  validateAggregateNodes
} from '../middleware/validate.js';

const router = express.Router();

router.post('/generate-nodes', validateGenerateNodes, generateNodes);
router.post('/generate-detail', validateGenerateDetail, generateNodeDetail);
router.post('/aggregate-nodes', validateAggregateNodes, aggregateNodes);

export default router;
