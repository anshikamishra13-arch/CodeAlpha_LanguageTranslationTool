import { useState, useEffect, useCallback } from 'react';
import { translateAPI } from '../services/api';

const LANGUAGES = [
  { code: 'auto', label: 'Detect language' },
  { code: 'English', label: 'English' },
  { code: 'Hindi', label: 'Hindi' },
  { code: 'Spanish', label: 'Spanish' },
  { code: 'French', label: 'French' },
  { code: 'German', label: 'German' },
  { code: 'Chinese (Simplified)', label: 'Chinese (Simplified)' },
  { code: 'Chinese (Traditional)', label: 'Chinese (Traditional)' },
  { code: 'Japanese', label: 'Japanese' },
  { code: 'Korean', label: 'Korean' },
  { code: 'Arabic', label: 'Arabic' },
  { code: 'Portuguese', label: 'Portuguese' },
  { code: 'Russian', label: 'Russian' },
  { code: 'Italian', label: 'Italian' },
  { code: 'Dutch', label: 'Dutch' },
  { code: 'Turkish', label: 'Turkish' },
  { code: 'Bengali', label: 'Bengali' },
  { code: 'Marathi', label: 'Marathi' },
  { code: 'Tamil', label: 'Tamil' },
  { code: 'Telugu', label: 'Telugu' },
  { code: 'Gujarati', label: 'Gujarati' },
  { code: 'Urdu', label: 'Urdu' },
  { code: 'Swahili', label: 'Swahili' },
  { code: 'Indonesian', label: 'Indonesian' },
  { code: 'Malay', label: 'Malay' },
  { code: 'Vietnamese', label: 'Vietnamese' },
  { code: 'Thai', label: 'Thai' },
  { code: 'Polish', label: 'Polish' },
  { code: 'Ukrainian', label: 'Ukrainian' },
];

const TARGET_LANGUAGES = LANGUAGES.filter((l) => l.code !== 'auto');

function HistoryItem({ item }) {
  const date = new Date(item.createdAt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-4 hover:bg-white/5 transition">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-blue-300/70 bg-blue-500/10 px-2 py-0.5 rounded-md font-medium">
          {item.sourceLang === 'auto' ? 'Auto' : item.sourceLang}
        </span>
        <span className="text-white/20 text-xs">→</span>
        <span className="text-xs text-purple-300/70 bg-purple-500/10 px-2 py-0.5 rounded-md font-medium">
          {item.targetLang}
        </span>
        <span className="ml-auto text-white/25 text-xs">{date}</span>
      </div>
      <p className="text-white/60 text-sm truncate">{item.inputText}</p>
      <p className="text-white/90 text-sm truncate mt-1">{item.outputText}</p>
    </div>
  );
}

export default function Translate({ user, onLogout }) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const data = await translateAPI.getHistory();
      setHistory(data.history);
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  async function handleTranslate() {
    if (!inputText.trim()) return;
    setError('');
    setOutputText('');
    setLoading(true);
    try {
      const data = await translateAPI.translate(inputText, sourceLang, targetLang);
      setOutputText(data.outputText);
      loadHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSwapLanguages() {
    if (sourceLang === 'auto') return;
    const prevSource = sourceLang;
    const prevTarget = targetLang;
    setSourceLang(prevTarget);
    setTargetLang(prevSource);
    setInputText(outputText);
    setOutputText('');
  }

  async function handleCopy() {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const charCount = inputText.length;
  const charLimit = 5000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/8 bg-white/3 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌐</span>
            <span className="font-bold text-white tracking-tight">LinguaAI</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-sm hidden sm:block">{user.email}</span>
            <button
              onClick={onLogout}
              className="text-white/40 hover:text-white/80 text-sm transition border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Language selectors + swap */}
        <div className="flex items-center gap-3 mb-4">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400/50 cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-800">
                {l.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleSwapLanguages}
            disabled={sourceLang === 'auto'}
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Swap languages"
          >
            <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
            </svg>
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400/50 cursor-pointer"
          >
            {TARGET_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-800">
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Translation area */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Input */}
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to translate..."
              maxLength={charLimit}
              rows={8}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-400/50 resize-none text-sm leading-relaxed"
            />
            <div className="absolute bottom-3 right-4 flex items-center gap-3">
              {inputText && (
                <button
                  onClick={() => { setInputText(''); setOutputText(''); }}
                  className="text-white/25 hover:text-white/60 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              )}
              <span className={`text-xs ${charCount > charLimit * 0.9 ? 'text-amber-400' : 'text-white/20'}`}>
                {charCount}/{charLimit}
              </span>
            </div>
          </div>

          {/* Output */}
          <div className="relative">
            <textarea
              value={loading ? '' : outputText}
              readOnly
              placeholder={loading ? '' : 'Translation will appear here...'}
              rows={8}
              className="w-full bg-white/3 border border-white/8 rounded-2xl px-5 py-4 text-white placeholder-white/15 resize-none text-sm leading-relaxed focus:outline-none"
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-3 text-blue-300/70">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  <span className="text-sm">Translating...</span>
                </div>
              </div>
            )}
            {outputText && !loading && (
              <button
                onClick={handleCopy}
                className="absolute bottom-3 right-4 text-xs flex items-center gap-1.5 text-white/30 hover:text-white/70 transition"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span className="text-green-400">Copied</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                    Copy
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Translate button */}
        <button
          onClick={handleTranslate}
          disabled={loading || !inputText.trim()}
          className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/30 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 mb-10"
        >
          {loading ? 'Translating...' : 'Translate'}
        </button>

        {/* History */}
        <div>
          <h2 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">
            Recent translations
          </h2>
          {historyLoading ? (
            <div className="text-white/20 text-sm text-center py-8">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-white/20 text-sm text-center py-8 border border-dashed border-white/8 rounded-xl">
              Your translations will appear here
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <HistoryItem key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
