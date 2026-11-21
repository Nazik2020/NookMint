'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'nooki';
  text: string;
  timestamp: string;
  intent?: string;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  sender: 'nooki',
  text: "👋 Ayubowan! I'm Nooki, your NookMint shopping assistant.\n\nAsk me anything about product availability, stock, prices, or Cash on Delivery across Sri Lanka!\n\nTry asking: *\"Is P00481 in stock?\"* or *\"Show kitchen items\"*.",
  timestamp: 'Just now',
};

const QUICK_SUGGESTIONS = [
  'Is P00481 in stock?',
  'Can I order 5 units of P00481?',
  'Cash on delivery puluwanda?',
  'Show kitchen items',
  'What are your categories?',
];

export const NookiChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or restore session ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedSession = sessionStorage.getItem('nooki_session_id');
      if (!storedSession) {
        storedSession = `nooki-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
        sessionStorage.setItem('nooki_session_id', storedSession);
      }
      setSessionId(storedSession);
    }
  }, []);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when opened on non-touch devices
      if (window.innerWidth >= 640) {
        inputRef.current?.focus();
      }
    }
  }, [isOpen, messages, isLoading]);

  const handleResetConversation = () => {
    const newSession = `nooki-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('nooki_session_id', newSession);
    }
    setSessionId(newSession);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'nooki',
        text: "👋 Conversation reset! How can I help you with NookMint products today?",
        timestamp: 'Just now',
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          sessionId,
        }),
      });

      const data = await res.json();

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'nooki',
        text: data.reply || "I'm sorry, I couldn't reach the server. Please try again shortly!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'nooki',
          text: '⚠️ Network connection issue. Please check your internet or reach us via WhatsApp (+94 71 489 7262).',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper to format URLs in text into clickable links
  const renderMessageContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2 break-all my-0.5"
          >
            <span>{part}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* ---------------- CHAT WINDOW ---------------- */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Nooki Store Chat Assistant"
          className="w-[calc(100vw-2.5rem)] sm:w-[410px] h-[550px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden mb-3.5 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="bg-[#004D40] text-white px-4 py-3.5 flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-emerald-500/30 flex items-center justify-center border border-emerald-300/40">
                <Bot className="w-5 h-5 text-emerald-200" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#004D40] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white tracking-wide">Nooki Assistant</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90 leading-tight">
                  Instant Stock, Prices & COD Inquiries
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetConversation}
                className="p-1.5 text-emerald-200/80 hover:text-white hover:bg-emerald-800/60 rounded-lg transition-colors"
                title="Restart conversation"
                aria-label="Restart conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-200/80 hover:text-white hover:bg-emerald-800/60 rounded-lg transition-colors"
                title="Close chat"
                aria-label="Close chat window"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Banner (when conversation is fresh) */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-emerald-50/70 border-b border-emerald-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0 ml-1" />
              <div className="flex items-center gap-1.5 text-nowrap">
                {QUICK_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item)}
                    className="text-[11px] font-medium bg-white hover:bg-emerald-100/70 text-slate-700 border border-emerald-200/80 px-2.5 py-1 rounded-full transition-all shadow-2xs hover:scale-101 active:scale-98"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[92%] ${
                    isUser ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line shadow-2xs ${
                      isUser
                        ? 'bg-[#004D40] text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                    }`}
                  >
                    {renderMessageContent(msg.text)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-2xl rounded-bl-xs text-slate-400 w-fit shadow-2xs">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200/90 shrink-0">
            <div className="flex items-center gap-2 bg-slate-100/90 rounded-xl px-3 py-1.5 border border-slate-200 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-600/10 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Nooki (e.g. Is P00481 in stock?)..."
                disabled={isLoading}
                className="w-full bg-transparent text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="p-1.5 bg-[#004D40] hover:bg-[#00382E] text-white rounded-lg disabled:opacity-30 disabled:hover:bg-[#004D40] transition-all shadow-2xs shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400">
              <span>Supports Singlish & Sinhala queries</span>
              <span>100% Cash on Delivery</span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- FLOATING LAUNCHER BUTTON ---------------- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close chat' : 'Open Nooki assistant chat'}
        className="group flex items-center gap-2.5 px-4 py-3 bg-[#004D40] hover:bg-[#00382E] text-white font-bold text-xs rounded-full shadow-lg shadow-emerald-950/20 transition-all hover:scale-105 active:scale-95 border-2 border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
        </span>

        {isOpen ? (
          <>
            <ChevronDown className="w-4 h-4 text-emerald-200 group-hover:translate-y-0.5 transition-transform" />
            <span>Minimize</span>
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4 fill-emerald-200/30 text-emerald-100" />
            <span className="tracking-wide text-[12px] font-bold">Ask Nooki</span>
          </>
        )}
      </button>
    </div>
  );
};
