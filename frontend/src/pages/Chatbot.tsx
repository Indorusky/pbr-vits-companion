import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';

import { Send, Bot, User, Sparkles } from 'lucide-react';

const QUICK_PROMPTS = [
  'How to boost my Physics score?',
  'Predict my attendance shortage',
  'When are the midterm exams?',
  'Generate a CS study plan for tonight',
];

const Chatbot = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I am your PBR VITS Academic Assistant. I can analyze your academic health score, predict attendance shortage, or help you study for upcoming exams. How can I assist you today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if prompt was passed from Dashboard
  useEffect(() => {
    if (location.state && (location.state as any).initialPrompt) {
      const prompt = (location.state as any).initialPrompt;
      setInput(prompt);
    }
  }, [location.state]);

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMessage = { role: 'user', content: queryText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText })
      });
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      // Smart local AI fallback response
      setTimeout(() => {
        let aiReply = `I am analyzing your academic query regarding "${queryText}".`;
        const q = queryText.toLowerCase();

        if (q.includes('physics')) {
          aiReply = 'Physics score is currently 85% with 69.5% attendance. To boost your score to 90%+, practice vector calculus problems and attend the next 3 consecutive lectures to cross the 75% attendance mark.';
        } else if (q.includes('attendance')) {
          aiReply = 'Your overall attendance is 81.5%. Math (88%), CS (92%), and Physics (69.5%). Attending 3 more Physics lectures will bring your total health score above 90/100.';
        } else if (q.includes('exam') || q.includes('midterm')) {
          aiReply = 'Midterm schedules: Math (Oct 15), Physics (Oct 18), CS (Oct 22). Recommended preparation order: Physics -> Math -> CS.';
        } else if (q.includes('cs') || q.includes('study plan')) {
          aiReply = 'Your CS score is an outstanding 95%. Recommended 2-hour study plan: 45 min revising graph algorithms, 45 min dynamic programming, and 30 min solving practice problems.';
        }

        setMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);
      }, 400);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Bot className="w-8 h-8 text-blue-600" />
          AI Assistant
        </h1>
        <p className="text-slate-500 text-sm mt-1">Ask me about your attendance, exams, or subject study advice.</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white shadow-sm border border-slate-100 text-blue-600'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-white shadow-sm border border-slate-100 text-slate-800 rounded-tl-sm'
              }`}>
                <p className="leading-relaxed text-sm md:text-base">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 text-blue-600 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-5 py-4 bg-white shadow-sm border border-slate-100 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="px-6 py-2 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => sendQuery(prompt)}
              className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-full font-medium text-slate-600 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <div className="p-6 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
