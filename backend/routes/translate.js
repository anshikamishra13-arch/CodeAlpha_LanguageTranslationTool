const express = require('express');
const authMiddleware = require('../middleware/auth');
const Translation = require('../models/Translation');
const { translate } = require('../Services/aiService');
const { translateValidation, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// POST /api/translate
router.post('/translate', authMiddleware, translateValidation, handleValidationErrors, async (req, res) => {
  try {
    const { inputText, sourceLang, targetLang } = req.body;

    // Trim and validate input
    const trimmedInput = inputText.trim();
    if (trimmedInput.length === 0) {
      return res.status(400).json({ error: 'Input text cannot be empty' });
    }

    if (trimmedInput.length > 5000) {
      return res.status(400).json({ error: 'Text too long (maximum 5000 characters)' });
    }

    // Call translation service
    let outputText;
    try {
      outputText = await translate(trimmedInput, sourceLang || 'auto', targetLang);
    } catch (translateErr) {
      console.error('Translation service error:', translateErr.message);

      // Handle specific translation errors
      if (translateErr.message.includes('No AI API key')) {
        return res.status(500).json({ error: 'Translation service not configured' });
      }

      if (translateErr.message.includes('HTTP')) {
        return res.status(503).json({ error: 'Translation service unavailable' });
      }

      return res.status(500).json({ error: 'Translation failed. Please try again.' });
    }

    // Save translation to database
    const record = await Translation.create({
      userId: req.userId,
      inputText: trimmedInput,
      outputText,
      sourceLang: sourceLang || 'auto',
      targetLang,
    });

    res.json({
      outputText,
      translationId: record._id,
      timestamp: record.createdAt,
    });
  } catch (err) {
    console.error('Translation endpoint error:', {
      message: err.message,
      userId: req.userId,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({ error: 'Failed to process translation. Please try again.' });
  }
});

// GET /api/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    // Pagination parameters with safe defaults
    let page = Math.max(1, parseInt(req.query.page) || 1);
    let limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

    // Validate page and limit are valid numbers
    if (!Number.isFinite(page) || !Number.isFinite(limit)) {
      page = 1;
      limit = 10;
    }

    const skip = (page - 1) * limit;

    // Fetch history and total count in parallel
    const [history, total] = await Promise.all([
      Translation.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean() // Use lean() for better performance
        .select('-userId -__v'),
      Translation.countDocuments({ userId: req.userId }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      history,
      pagination: {
        total,
        page,
        limit,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error('History fetch error:', {
      message: err.message,
      userId: req.userId,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({ error: 'Failed to fetch translation history' });
  }
});

module.exports = router;