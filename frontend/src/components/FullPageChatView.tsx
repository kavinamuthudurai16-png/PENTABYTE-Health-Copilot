import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Paperclip, 
  Bot, 
  User, 
  Calendar, 
  ArrowRight, 
  FileText, 
  ShieldAlert, 
  RefreshCw,
  FileQuestion,
  HelpCircle,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { ChatMessage, ChatSession, PatientProfile } from '../types';
import { StructuredChatCards } from './StructuredChatCards';

interface FullPageChatViewProps {
  currentLang: string;
  patient: PatientProfile | null;
  onRecordCreated?: () => void;
}

const STARTER_QUESTIONS = [
  {
    id: 1,
    title: "Explain my latest report",
    desc: "Understand lab values in plain language",
    query: "Explain my latest medical report in simple language.",
    icon: FileText,
    badge: "Lab Insights"
  },
  {
    id: 2,
    title: "Compare previous & latest reports",
    desc: "See what changed between June and Sept 2026",
    query: "What changed between my previous and latest reports?",
    icon: RefreshCw,
    badge: "Trends"
  },
  {
    id: 3,
    title: "Medicines in uploaded prescriptions",
    desc: "Active medications, timing & dosage schedule",
    query: "Find the medicines mentioned in my uploaded prescriptions.",
    icon: Sparkles,
    badge: "Rx Review"
  },
  {
    id: 4,
    title: "Summarize my health records",
    desc: "Complete overview of diagnoses, labs & vitals",
    query: "Summarize my health records.",
    icon: FileQuestion,
    badge: "Summary"
  },
  {
    id: 5,
    title: "Prepare for doctor appointment",
    desc: "Key questions & clinical brief for Dr. Radhakrishnan",
    query: "Help me prepare for my next doctor appointment.",
    icon: Calendar,
    badge: "Consultation"
  },
  {
    id: 6,
    title: "Explain medical terms",
    desc: "Demystify HbA1c, FBS & Serum Creatinine",
    query: "Explain this medical term in simple English.",
    icon: HelpCircle,
    badge: "Definitions"
  },
  {
    id: 7,
    title: "அறிக்கையை தமிழில் விளக்குங்கள்",
    desc: "மருத்துவ அறிக்கை விளக்கம் தமிழில்",
    query: "Explain my report in Tamil.",
    icon: MessageSquare,
    badge: "தமிழ்"
  },
  {
    id: 8,
    title: "Profile verification items",
    desc: "Find unverified records or pending items",
    query: "Which information in my profile still needs verification?",
    icon: AlertCircle,
    badge: "Verification"
  }
];

export const FullPageChatView: React.FC<FullPageChatViewProps> = ({
  currentLang,
  patient,
  onRecordCreated
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all chat sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/chat/sessions');
      if (res.ok) {
        const data: ChatSession[] = await res.json();
        setSessions(data);
        if (data.length > 0 && !activeSessionId) {
          setActiveSessionId(data[0].id);
          setMessages(data[0].messages || []);
        }
      }
    } catch (err) {
      console.error('Failed to load chat sessions', err);
    }
  };

  // Switch session
  const selectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    const selected = sessions.find(s => s.id === sessionId);
    if (selected) {
      setMessages(selected.messages || []);
    }
  };

  // Create new session
  const handleNewSession = async () => {
    try {
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const newSession: ChatSession = await res.json();
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setMessages(newSession.messages || []);
      }
    } catch (err) {
      console.error('Failed to create new session', err);
    }
  };

  // Delete session
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this consultation history?')) return;
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        const remaining = sessions.filter(s => s.id !== sessionId);
        setSessions(remaining);
        if (activeSessionId === sessionId) {
          if (remaining.length > 0) {
            setActiveSessionId(remaining[0].id);
            setMessages(remaining[0].messages || []);
          } else {
            handleNewSession();
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  // Clear all sessions
  const handleClearAll = async () => {
    if (!confirm('Clear all conversation history? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/chat/sessions', { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setSessions([data.session]);
          setActiveSessionId(data.session.id);
          setMessages(data.session.messages || []);
        }
      }
    } catch (err) {
      console.error('Failed to clear sessions', err);
    }
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Send message
  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessageText = textToSend.trim();
    if (!textOverride) setInput('');

    const optimisticUserMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, optimisticUserMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageText,
          session_id: activeSessionId || undefined,
          language: currentLang,
          user_id: patient?.patient_id || 'PENTABYTE-PATIENT-001'
        })
      });

      if (!res.ok) {
        throw new Error(`Chat error status ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations,
        structured_card: data.structured_card,
        ai_provider: data.ai_provider
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Update sessions list
      setSessions(prev => prev.map(s => {
        if (s.id === data.session_id) {
          return {
            ...s,
            updated_at: data.timestamp,
            title: s.title.startsWith('Consultation') || s.title === 'New Consultation' 
              ? userMessageText.slice(0, 30) + '...' 
              : s.title,
            messages: [...(s.messages || []), optimisticUserMsg, assistantMsg]
          };
        }
        return s;
      }));

      if (!activeSessionId) {
        setActiveSessionId(data.session_id);
      }
    } catch (err) {
      console.error('Chat error', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: "I couldn't reach the health reasoning service. Please check your network or try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy message text
  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Handle document upload directly inside chat
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (activeSessionId) formData.append('session_id', activeSessionId);
    formData.append('user_id', patient?.patient_id || 'PENTABYTE-PATIENT-001');
    formData.append('language', currentLang);

    try {
      const res = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('File upload failed');

      const data = await res.json();

      const userUploadMsg: ChatMessage = {
        id: `msg-upl-${Date.now()}`,
        role: 'user',
        content: `📎 Uploaded medical report: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
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
      fetchSessions();
    } catch (err: any) {
      setUploadError('Failed to process medical document. Please try a valid PDF or image file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] min-h-[640px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
      
      {/* 1. SESSIONS HISTORY SIDEBAR */}
      <aside className="w-full lg:w-72 bg-slate-50/80 dark:bg-slate-900/60 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col p-3.5 space-y-3">
        
        {/* New Chat Button */}
        <button
          onClick={handleNewSession}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Consultation</span>
        </button>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar pr-1 max-h-48 lg:max-h-full">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
            Consultation History
          </div>

          {sessions.map(s => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-semibold border border-cyan-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-cyan-500' : 'text-slate-400'}`} />
                  <span className="truncate">{s.title || 'Consultation'}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, s.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                  title="Delete consultation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Clear All Sessions Option */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleClearAll}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear all conversations</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CHAT ARENA */}
      <section className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  HealthLens AI Assistant
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Grounded RAG
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connected to {patient?.full_name || 'Kavina M'} • {patient?.chronic_conditions?.join(', ') || 'Type 2 Diabetes, Hypertension'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
              ABHA: {patient?.abha_id || '91-8472-1092-3841'}
            </span>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
          
          {/* Welcome Card & 8 Starter Prompts (Shown if <= 1 message) */}
          {messages.length <= 1 && (
            <div className="max-w-3xl mx-auto space-y-4 my-2">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 border border-cyan-500/20 text-slate-800 dark:text-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm text-cyan-600 dark:text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Welcome to HealthLens AI Clinical Assistant</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Hi! I'm your HealthLens AI assistant. I can help you understand your medical records, 
                  compare reports, track medication history, and prepare questions for your doctor. 
                  Choose a starter question below or ask anything about your health journey!
                </p>
              </div>

              {/* 8 Suggested Questions Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {STARTER_QUESTIONS.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSendMessage(item.query)}
                      className="group p-3 rounded-xl bg-slate-50 hover:bg-cyan-50/50 dark:bg-slate-900/80 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 text-left transition-all cursor-pointer shadow-sm flex items-start gap-3"
                    >
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium ml-1">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Render Active Messages */}
          {messages.map(msg => {
            const isUser = msg.role === 'user' || msg.sender === 'user';
            const textContent = msg.content || msg.text || '';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm ${
                  isUser 
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-600' 
                    : 'bg-gradient-to-tr from-slate-800 to-slate-900 border border-cyan-500/30 text-cyan-400'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/10 rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-tl-none'
                  }`}>
                    <div className="whitespace-pre-wrap">{textContent}</div>

                    {/* Structured Cards (if any) */}
                    {msg.structured_card && (
                      <StructuredChatCards card={msg.structured_card} />
                    )}

                    {/* Citations List */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-cyan-500" /> Citations:
                        </span>
                        {msg.citations.map((c, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800/90 text-[10px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                          >
                            <span>{c.title}</span>
                            <span className="text-slate-400 font-mono text-[9px]">({c.date})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Metadata Bar (Timestamp, Copy Button, AI Model) */}
                  <div className={`flex items-center gap-3 text-[10px] text-slate-400 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && msg.ai_provider && (
                      <span className="font-mono text-cyan-600 dark:text-cyan-400">
                        • {msg.ai_provider}
                      </span>
                    )}
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, textContent)}
                        className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copy response"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
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
            <div className="flex gap-3 max-w-md mr-auto animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-400 ml-2">Reviewing patient records...</span>
              </div>
            </div>
          )}

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-700 dark:text-cyan-300">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-500" />
              <span>Ingesting and extracting medical report via OCR engine...</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-end gap-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl p-2 shadow-inner focus-within:border-cyan-500 transition-colors">
            
            {/* File Upload Attachment Trigger */}
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
              className="p-2 text-slate-400 hover:text-cyan-500 transition-colors cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
              title="Upload PDF or image medical report"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Expanding Textarea */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your lab results, medications, or reports (Press Enter to send, Shift+Enter for new line)..."
              rows={1}
              className="flex-1 max-h-32 bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none resize-none py-1.5 px-1 leading-relaxed"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 disabled:opacity-40 text-white transition-all cursor-pointer shadow-md shadow-cyan-500/20 flex-shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-cyan-500" />
              Educational Assistant • Not a medical prescription or diagnosis
            </span>
            <span className="hidden sm:inline">
              Powered by HealthLens Grounded RAG & Google Gemini
            </span>
          </div>
        </div>

      </section>

    </div>
  );
};
