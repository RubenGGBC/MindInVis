import { body, validationResult } from 'express-validator';

export const validateGenerateNodes = [
  body('nodeText')
    .isString()
    .withMessage('nodeText must be a string')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('nodeText must be between 1 and 500 characters'),

  body('nodeTipo')
    .isString()
    .withMessage('nodeTipo must be a string')
    .isIn(['pregunta', 'respuesta', 'root'])
    .withMessage('nodeTipo must be one of: pregunta, respuesta, root'),

  body('count')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('count must be an integer between 1 and 8')
    .toInt(),

  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];
