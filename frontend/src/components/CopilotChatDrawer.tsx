import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  User, 
  Activity, 
  ShieldAlert, 
  RefreshCw 
} from 'lucide-react';
import { ChatMessage } from '../types';

interface CopilotChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
}

const STARTER_PROMPTS = [
  "Explain my HbA1c 8.2% test result",
  "Can I take Metformin before eating?",
  "What does elevated Cholesterol mean?",
  "How can I lower my blood pressure naturally?"
];

export const CopilotChatDrawer: React.FC<CopilotChatDrawerProps> = ({
  isOpen,
  onClose,
  currentLang
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: "Hello Kavina! I am your PENTABYTE Personal Health Copilot. I have analyzed your unified health timeline, including your recent HbA1c test and active prescriptions. How can I help you understand your health journey today?",
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: currentLang
        })
      });

      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: 'Just now',
        references: data.referenced_records
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I experienced a temporary difficulty fetching that clinical reference. Please verify your connection or try again shortly.",
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col animate-slideLeft">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-display flex items-center gap-1.5">
              Health Copilot Assistant
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            </h4>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Patient Context Active
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="px-4 py-2 bg-amber-50 dark:bg-slate-900/40 border-b border-amber-100 dark:border-slate-800/80 text-[10px] text-amber-800 dark:text-slate-400 flex items-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>Educational advice only. Always consult your prescribing doctor.</span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
              m.sender === 'user'
                ? 'bg-cyan-600 text-white rounded-tr-none'
                : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none whitespace-pre-line'
            }`}>
              {m.text}
              <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 text-right">
                {m.timestamp}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-500" />
            Synthesizing clinical insights...
          </div>
        )}
      </div>

      {/* Quick Prompt Pills */}
      <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/90 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        {STARTER_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
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
            placeholder="Ask about medications, blood tests, diets..."
            className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
