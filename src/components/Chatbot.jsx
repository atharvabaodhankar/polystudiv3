import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL;

const QUICK_CHIPS = [
  'Show CM3K notes',
  'Solved papers for EJ2K',
  'How to upload a file?',
  'What is PolyStudi?',
  'Take me to CM4K',
];

const TypingDots = () => (
  <div className="flex items-center gap-1 py-1 px-2">
    {[0, 1, 2].map(i => (
      <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: `👋 Hey there! I'm PolyBot, your PolyStudi assistant.\n\nHere's what I can do for you:\n📚 Find notes, solved papers & assignments\n🔍 Search by subject name (e.g. "DBMS notes", "Java solved papers")\n🧭 Navigate to any class or section\n❓ Answer questions about PolyStudi\n\nJust type your question or pick one below!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');
    setShowChips(false);
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const { reply, navigateTo, materials } = json.data;
      setMessages(prev => [...prev, { role: 'bot', content: reply, materials: materials?.length ? materials : null }]);
      setHistory(prev => [...prev, { role: 'user', content: userText }, { role: 'assistant', content: reply }]);

      if (navigateTo) {
        setMessages(prev => [...prev, { role: 'nav', content: `Navigating to ${navigateTo}…` }]);
        setTimeout(() => navigate(navigateTo), 900);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I'm having trouble right now. Please try again!" }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Chat Window */}
      <div className={`fixed bottom-20 right-4 sm:right-6 z-50 flex flex-col
        w-[calc(100vw-32px)] sm:w-[360px] h-[70vh] sm:h-[520px]
        bg-white rounded-2xl shadow-2xl border border-gray-200
        transition-all duration-300 ease-in-out origin-bottom-right
        overflow-hidden
        ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <img src="/polybot.png" alt="PolyBot" className="w-8 h-8 rounded-full object-cover" />
            <div>
              <p className="text-white font-semibold text-sm leading-none">PolyBot</p>
              <p className="text-purple-200 text-xs">PolyStudi Assistant</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors text-lg">✕</button>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === 'user' && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm rounded-2xl rounded-br-sm px-4 py-2 whitespace-pre-line">{msg.content}</div>
                </div>
              )}
              {msg.role === 'bot' && (
                <div className="flex items-start gap-2">
                  <img src="/polybot.png" alt="PolyBot" className="w-6 h-6 rounded-full object-cover mt-0.5 shrink-0" />
                  <div className="max-w-[85%] flex flex-col gap-2">
                    <div className="bg-gray-100 text-gray-800 text-sm rounded-2xl rounded-bl-sm px-4 py-2 whitespace-pre-line">{msg.content}</div>
                    {msg.materials && msg.materials.map((mat, mi) => (
                      <div key={mi} className="bg-white border border-purple-100 rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-sm">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-[#342F76] truncate">{mat.title}</span>
                          <span className="text-[10px] text-gray-400">by {mat.uploader || 'Unknown'}</span>
                        </div>
                        <a href={mat.file_url} target="_blank" rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold hover:opacity-90 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8" />
                          </svg>
                          Open
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {msg.role === 'nav' && (
                <div className="flex justify-center">
                  <div className="bg-amber-100 text-amber-800 text-xs rounded-full px-3 py-1 border border-amber-200">{msg.content}</div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-2">
              <img src="/polybot.png" alt="PolyBot" className="w-6 h-6 rounded-full object-cover mt-0.5 shrink-0" />
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-1"><TypingDots /></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips */}
        {showChips && (
          <div className="px-3 pb-2 flex flex-wrap gap-2">
            {QUICK_CHIPS.map(chip => (
              <button key={chip} onClick={() => sendMessage(chip)}
                className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-3 py-1 hover:bg-purple-100 transition-colors">
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 p-3 border-t border-gray-100">
          <input ref={inputRef} type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            disabled={loading}
            placeholder="Ask PolyBot anything…"
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400 disabled:opacity-50 transition-colors" />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity">
            ➤
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-2">
        {!isOpen && showTooltip && (
          <div className="relative bg-white text-[#342F76] text-xs font-medium px-3 py-2 rounded-xl shadow-lg border border-purple-100 whitespace-nowrap">
            👋 Hi! Need help finding notes?
            <div className="absolute bottom-[-6px] right-5 w-3 h-3 bg-white border-r border-b border-purple-100 rotate-45" />
          </div>
        )}
        <button onClick={() => { setIsOpen(o => !o); setShowTooltip(false); }}
          className={`w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg overflow-hidden
            flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200
            ${!isOpen ? 'animate-bounce' : ''}`}>
          {isOpen
            ? <span className="text-white text-2xl">✕</span>
            : <img src="/polybot.png" alt="PolyBot" className="w-full h-full object-cover" />
          }
        </button>
      </div>
    </>
  );
};

export default Chatbot;
