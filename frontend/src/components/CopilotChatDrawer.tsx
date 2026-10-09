import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  ShieldAlert, 
  RefreshCw, 
  Paperclip, 
  Copy, 
  Check, 
  Trash2, 
  FileText,
  Calendar,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  FileQuestion,
  Maximize2
} from 'lucide-react';
import { ChatMessage, PatientProfile } from '../types';
import { StructuredChatCards } from './StructuredChatCards';

interface CopilotChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  patient?: PatientProfile | null;
  onOpenFullPageChat?: () => void;
  onRecordCreated?: () => void;
}

const STARTER_PROMPTS = [
  {
    title: "Explain my latest report",
    query: "Explain my latest medical report in simple language.",
    icon: FileText
  },
  {
    title: "What changed between reports?",
    query: "What changed between my previous and latest reports?",
    icon: RefreshCw
  },
  {
    title: "Find medicines in prescriptions",
    query: "Find the medicines mentioned in my uploaded prescriptions.",
    icon: Sparkles
  },
  {
    title: "Summarize my health records",
    query: "Summarize my health records.",
    icon: FileQuestion
  },
  {
    title: "Prepare for doctor appointment",
    query: "Help me prepare for my next doctor appointment.",
    icon: Calendar
  },
  {
    title: "Explain medical terms",
    query: "Explain this medical term in simple English.",
    icon: HelpCircle
  },
  {
    title: "அறிக்கையை தமிழில் விளக்குங்கள்",
    query: "Explain my report in Tamil.",
    icon: MessageSquare
  },
  {
    title: "Profile verification items",
    query: "Which information in my profile still needs verification?",
    icon: AlertCircle
  }
];

export const CopilotChatDrawer: React.FC<CopilotChatDrawerProps> = ({
  isOpen,
  onClose,
  currentLang,
  patient,
  onOpenFullPageChat,
  onRecordCreated
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: "Hi! I'm your HealthLens AI assistant. I can help you understand your medical records, compare reports, and prepare questions for your doctor.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ai_provider: "HealthLens Grounded Clinical Engine"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMessageText = query.trim();
    if (!textToSend) setInput('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageText,
          session_id: sessionId || undefined,
          language: currentLang,
          user_id: patient?.patient_id || 'PENTABYTE-PATIENT-001'
        })
      });

      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();

      if (data.session_id) setSessionId(data.session_id);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations,
        structured_card: data.structured_card,
        ai_provider: data.ai_provider
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "I experienced a temporary difficulty connecting to the health reasoning engine. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    if (!confirm('Clear this chat conversation?')) return;
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        role: 'assistant',
        content: "Hi! I'm your HealthLens AI assistant. I can help you understand your medical records, compare reports, and prepare questions for your doctor.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ai_provider: "HealthLens Grounded Clinical Engine"
      }
    ]);
  };

  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (sessionId) formData.append('session_id', sessionId);
    formData.append('user_id', patient?.patient_id || 'PENTABYTE-PATIENT-001');
    formData.append('language', currentLang);

    try {
      const res = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('File upload failed');
      const data = await res.json();
      if (data.session_id) setSessionId(data.session_id);

      const userUploadMsg: ChatMessage = {
        id: `msg-upl-${Date.now()}`,
        role: 'user',
        content: `📎 Uploaded report: ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const assistantUploadMsg: ChatMessage = {
        id: `msg-upl-res-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations,
        structured_card: data.structured_card,
        ai_provider: data.ai_provider
      };

      setMessages(prev => [...prev, userUploadMsg, assistantUploadMsg]);
      if (onRecordCreated) onRecordCreated();
    } catch (err) {
      alert('Failed to upload and parse report.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] lg:w-[520px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col animate-slideLeft">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                HealthLens AI Assistant
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-semibold border border-cyan-500/30">
                Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Personal Health Copilot • Multilingual
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          {onOpenFullPageChat && (
            <button
              onClick={() => {
                onClose();
                onOpenFullPageChat();
              }}
              className="p-1.5 hover:text-cyan-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Open full-page chat"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleClear}
            className="p-1.5 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        
        {messages.map((msg) => {
          const isUser = msg.role === 'user' || msg.sender === 'user';
          const textContent = msg.content || msg.text || '';

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs ${
                isUser 
                  ? 'bg-cyan-600' 
                  : 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
              }`}>
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                  isUser 
                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-sm' 
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-wrap">{textContent}</div>

                  {msg.structured_card && (
                    <StructuredChatCards card={msg.structured_card} />
                  )}

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800 flex flex-wrap gap-1">
                      {msg.citations.map((c, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                          {c.title} ({c.date})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, textContent)}
                      className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-0.5 cursor-pointer"
                      title="Copy"
                    >
                      {copiedMsgId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-slate-400 p-2">
            <Bot className="w-4 h-4 text-cyan-500 animate-spin-slow" />
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="ml-1 text-[11px]">Analyzing authorized health records...</span>
          </div>
        )}

        {isUploading && (
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-700 dark:text-cyan-300 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-500" />
            <span>Extracting medical report via OCR...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts Carousel / Grid */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60">
        <div className="text-[10px] font-semibold text-slate-400 mb-2 flex items-center gap-1 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-cyan-500" /> Suggested Questions
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {STARTER_PROMPTS.map((prompt, idx) => {
            const Icon = prompt.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(prompt.query)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap transition-all shadow-xs cursor-pointer flex-shrink-0"
              >
                <Icon className="w-3 h-3 text-cyan-500" />
                <span>{prompt.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex items-end gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-1.5 focus-within:border-cyan-500 transition-colors">
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,image/png,image/jpeg,image/jpg"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isLoading}
            className="p-1.5 text-slate-400 hover:text-cyan-500 transition-colors cursor-pointer rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 flex-shrink-0"
            title="Upload medical PDF or image"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about lab results, meds, trends..."
            rows={1}
            className="flex-1 max-h-24 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none resize-none py-1 px-1 leading-snug"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 disabled:opacity-40 text-white transition-all cursor-pointer shadow-sm flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-cyan-500" /> Informational health assistant
          </span>
          <span>Shift+Enter for new line</span>
        </div>
      </div>

    </div>
  );
};
