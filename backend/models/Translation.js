const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inputText: { type: String, required: true },
  outputText: { type: String, required: true },
  sourceLang: { type: String, required: true },
  targetLang: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Translation', translationSchema);
