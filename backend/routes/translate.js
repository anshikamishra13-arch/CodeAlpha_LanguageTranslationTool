const express = require('express');
const authMiddleware = require('../middleware/auth');
const Translation = require('../models/Translation');
// Bug 1: fixed casing — 'Services' → 'services' (case-sensitive on Linux)
const { translate } = require('../services/aiService');

const router = express.Router();

// POST /api/translate
router.post('/translate', authMiddleware, async (req, res) => {
  try {
    const { inputText, sourceLang, targetLang } = req.body;

    if (!inputText || !targetLang)
      return res.status(400).json({ error: 'inputText and targetLang are required' });

    // Bug 2: trim first, then validate — both checks operate on the trimmed value
    const trimmedInput = inputText.trim();
    if (trimmedInput.length === 0)
      return res.status(400).json({ error: 'Input text cannot be empty' });
    if (trimmedInput.length > 5000)
      return res.status(400).json({ error: 'Text too long (max 5000 characters)' });

    const outputText = await translate(trimmedInput, sourceLang || 'auto', targetLang);

    const record = await Translation.create({
      userId: req.userId,
      inputText: trimmedInput,
      outputText,
      sourceLang: sourceLang || 'auto',
      targetLang,
    });

    res.json({ outputText, translationId: record._id });
  } catch (err) {
    // Bug 3: log full error server-side, return only a generic message to client
    console.error('Translation error:', err.message);
    res.status(500).json({ error: 'Translation failed. Please try again.' });
  }
});

// GET /api/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    // Bug 4: support pagination via query params — defaults to page 1, limit 10
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10); // cap at 50
    const skip  = (page - 1) * limit;

    const [history, total] = await Promise.all([
      Translation.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-userId'),
      Translation.countDocuments({ userId: req.userId }),
    ]);

    res.json({
      history,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    // Bug 5: log the error — was silently swallowed before
    console.error('History fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;