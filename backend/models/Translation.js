const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema(
  {
    // Fix 3: index: true — fast lookups by user
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Fix 2: trim whitespace + enforce a reasonable size limit
    inputText:  { type: String, required: true, trim: true, maxlength: 5000 },
    outputText: { type: String, required: true, trim: true, maxlength: 5000 },

    // Fix 2: trim + uppercase so 'en', 'EN', ' en ' all store as 'EN'
    sourceLang: { type: String, required: true, trim: true, uppercase: true, maxlength: 10 },
    targetLang: { type: String, required: true, trim: true, uppercase: true, maxlength: 10 },
  },
  // Fix 1: let Mongoose manage createdAt AND updatedAt automatically
  { timestamps: true }
);

module.exports = mongoose.model('Translation', translationSchema);
