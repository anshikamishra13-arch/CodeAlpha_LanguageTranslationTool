const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function translateWithOpenAI(inputText, sourceLang, targetLang) {
  const prompt =
    sourceLang === 'auto'
      ? `Detect the language and translate the following text to ${targetLang}. Return only the translated text, nothing else:\n\n${inputText}`
      : `Translate the following text from ${sourceLang} to ${targetLang}. Return only the translated text, nothing else:\n\n${inputText}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert language translator. Translate accurately while preserving tone, meaning, and formatting. Return only the translated text.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  return response.choices[0].message.content.trim();
}

async function translateWithGemini(inputText, sourceLang, targetLang) {
  const prompt =
    sourceLang === 'auto'
      ? `Detect the language and translate to ${targetLang}. Return only the translated text:\n\n${inputText}`
      : `Translate from ${sourceLang} to ${targetLang}. Return only the translated text:\n\n${inputText}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}

async function translate(inputText, sourceLang, targetLang) {
  try {
    if (process.env.OPENAI_API_KEY) {
      return await translateWithOpenAI(inputText, sourceLang, targetLang);
    }
    if (process.env.GEMINI_API_KEY) {
      return await translateWithGemini(inputText, sourceLang, targetLang);
    }
    throw new Error('No AI API key configured');
  } catch (err) {
    if (process.env.GEMINI_API_KEY && err.message !== 'No AI API key configured') {
      try {
        return await translateWithGemini(inputText, sourceLang, targetLang);
      } catch (fallbackErr) {
        throw new Error('Translation failed on both OpenAI and Gemini');
      }
    }
    throw err;
  }
}

module.exports = { translate };
