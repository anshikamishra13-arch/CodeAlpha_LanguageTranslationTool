const express = require('express');
const authMiddleware = require('../middleware/auth');
const Translation = require('../models/Translation');
const { translate } = require('../Services/aiService');

const router = express.Router();

// POST /api/translate
router.post('/translate', authMiddleware, async (req, res) => {
  try {
    const { inputText, sourceLang, targetLang } = req.body;
    if (!inputText || !targetLang)
      return res.status(400).json({ error: 'inputText and targetLang are required' });
    if (inputText.trim().length === 0)
      return res.status(400).json({ error: 'Input text cannot be empty' });
    if (inputText.length > 5000)
      return res.status(400).json({ error: 'Text too long (max 5000 characters)' });

    const outputText = await translate(inputText.trim(), sourceLang || 'auto', targetLang);

    const record = await Translation.create({
      userId: req.userId,
      inputText: inputText.trim(),
      outputText,
      sourceLang: sourceLang || 'auto',
      targetLang,
    });

    res.json({ outputText, translationId: record._id });
  } catch (err) {
    console.error('Translation error:', err.message);
    res.status(500).json({ error: err.message || 'Translation failed' });
  }
});

// GET /api/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await Translation.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-userId');
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
