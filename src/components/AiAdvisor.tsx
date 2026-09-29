import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { Project } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  User as UserIcon,
  HelpCircle,
  Lightbulb,
  CornerDownLeft,
  X
} from 'lucide-react';

interface AiAdvisorProps {
  currentProject?: Project | null;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({ currentProject }) => {
  const { t } = useI18n();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Hello! I am your POD Advisor. I can analyze niche saturation, suggest creative variations, evaluate trademark risks, or refine your Etsy keyword strategy. What are we brainstorming today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    'Is this idea worth researching?',
    'Give me 5 variations.',
    'Make this less saturated.',
    'Change this to a women\'s audience.',
    'Turn this into a hoodie.',
    'Explain the risk.'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          projectContext: currentProject || undefined
        })
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, I encountered an issue connecting to the AI advisor service. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col rounded-3xl bg-[#12141e] border border-gray-800 overflow-hidden shadow-2xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/80 bg-[#0e1017] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{t('advisor.title', 'AI POD Advisor')}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE
              </span>
            </h2>
            {currentProject && (
              <p className="text-[11px] text-gray-400 truncate max-w-sm">
                Context: <strong className="text-gray-200">{currentProject.name}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                  : 'bg-[#181a26] text-gray-200 border border-gray-800 rounded-bl-none'
              }`}
            >
              {m.text}
            </div>

            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-gray-800 text-gray-400 flex items-center justify-center shrink-0 mt-0.5">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 animate-pulse">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>AI POD Advisor is thinking...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-[#0e1017] border-t border-gray-800/60 overflow-x-auto flex items-center gap-2 text-xs">
        <span className="text-[10px] font-mono text-gray-500 uppercase shrink-0">Quick Prompts:</span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-lg bg-[#181a26] hover:bg-[#222538] text-gray-300 hover:text-white border border-gray-800 text-[11px] whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-[#0e1017] border-t border-gray-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('advisor.placeholder', 'Ask anything about this niche, tags, variations, or risks...')}
            className="flex-1 px-4 py-2.5 bg-[#151724] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shadow-md shadow-indigo-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
