const { OpenAI } = require('openai');

// BUG 1 FIX: Guard OpenAI client instantiation — crashing at startup if key is missing
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

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

  // BUG 2 FIX: No null-check on response — will throw TypeError if choices is empty
  if (!response.choices || response.choices.length === 0) {
    throw new Error('OpenAI returned an empty response');
  }

  return response.choices[0].message.content.trim();
}

async function translateWithGemini(inputText, sourceLang, targetLang) {
  const prompt =
    sourceLang === 'auto'
      ? `Detect the language and translate to ${targetLang}. Return only the translated text:\n\n${inputText}`
      : `Translate from ${sourceLang} to ${targetLang}. Return only the translated text:\n\n${inputText}`;

  // BUG 3 FIX: gemini-pro is deprecated — use gemini-1.5-flash
  // BUG 4 FIX: API key exposed in URL (leaks into logs/history) — move to header
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,  // secure header instead of URL param
      },
      body: JSON.stringify({
        // BUG 5 FIX: No system instruction sent to Gemini — inconsistent behaviour vs OpenAI
        system_instruction: {
          parts: [{ text: 'You are an expert language translator. Translate accurately while preserving tone, meaning, and formatting. Return only the translated text.' }],
        },
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  // BUG 6 FIX: HTTP errors not checked — a 4xx/5xx silently falls through to JSON parse
  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini HTTP ${response.status}: ${errBody}`);
  }

  const data = await response.json();

  // BUG 7 FIX: No null-check on nested response — blindly accessing candidates[0] throws
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini returned an empty candidates array');
  }
  const parts = data.candidates[0]?.content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error('Gemini returned no content parts');
  }

  return parts[0].text.trim();
}

async function translate(inputText, sourceLang, targetLang) {
  // BUG 8 FIX: No input validation — null/undefined/non-string silently propagates
  if (!inputText || typeof inputText !== 'string' || inputText.trim() === '') {
    throw new Error('inputText must be a non-empty string');
  }

  // BUG 9 FIX: Broken fallback logic — if OPENAI_API_KEY exists but the call fails,
  // the catch block tries Gemini only when err.message !== 'No AI API key configured'.
  // But if ONLY Gemini is configured, the outer try never reaches the Gemini branch
  // because the catch fires on the OpenAI throw, skipping the second if entirely.
  // Rewrite as a clean try-each-provider loop so the fallback always works.
  const errors = [];

  if (process.env.OPENAI_API_KEY) {
    try {
      return await translateWithOpenAI(inputText, sourceLang, targetLang);
    } catch (err) {
      errors.push(`OpenAI: ${err.message}`);
    }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      return await translateWithGemini(inputText, sourceLang, targetLang);
    } catch (err) {
      errors.push(`Gemini: ${err.message}`);
    }
  }

  if (errors.length === 0) {
    throw new Error('No AI API key configured. Set OPENAI_API_KEY or GEMINI_API_KEY.');
  }

  throw new Error(`Translation failed — ${errors.join(' | ')}`);
}

module.exports = { translate };