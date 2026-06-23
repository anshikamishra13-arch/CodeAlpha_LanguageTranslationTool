const { body, validationResult } = require('express-validator');

// Validation error handler middleware
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.param, message: e.msg })),
    });
  }
  next();
}

// Email validation rule
const validateEmail = body('email')
  .trim()
  .toLowerCase()
  .isEmail()
  .withMessage('Please provide a valid email address')
  .isLength({ max: 255 })
  .withMessage('Email must be less than 255 characters');

// Password validation rule
const validatePassword = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters')
  .isLength({ max: 128 })
  .withMessage('Password must be less than 128 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number');

// Name validation rule
const validateName = body('name')
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('Name must be between 2 and 100 characters')
  .matches(/^[a-zA-Z\s'-]+$/)
  .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes');

// Phone validation rule (10 digits)
const validatePhone = body('phone')
  .trim()
  .matches(/^[0-9]{10}$/)
  .withMessage('Phone must be exactly 10 digits');

// Translation input validation
const validateTranslationInput = [
  body('inputText')
    .trim()
    .notEmpty()
    .withMessage('Input text is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Input text must be between 1 and 5000 characters'),
  body('targetLang')
    .trim()
    .notEmpty()
    .withMessage('Target language is required')
    .isLength({ max: 50 })
    .withMessage('Language code must be less than 50 characters'),
  body('sourceLang')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Language code must be less than 50 characters'),
];

// Export validation chains
module.exports = {
  // Error handler
  handleValidationErrors,

  // Auth validation chains
  registerValidation: [validateEmail, validatePassword, validateName, validatePhone],
  loginValidation: [validateEmail, validatePassword],

  // Translation validation chain
  translateValidation: validateTranslationInput,

  // Individual validators (for custom use)
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
};
