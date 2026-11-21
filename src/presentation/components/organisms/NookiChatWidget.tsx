
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Send,
  X,
  Minus,
  RotateCcw,
  Search,
  Package,
  CreditCard,
  Truck,
  ExternalLink,
  Leaf,
  ShieldCheck,
  Languages,
  Sparkles,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'nooki';
  text: string;
  timestamp: string;
  intent?: string;
}

const QUICK_ACTIONS = [
  {
    icon: Search,
    label: 'Find a product',
    query: 'Show me popular products on NookMint',
  },
  {
    icon: Package,
    label: 'Check stock',
    query: 'Is P00481 in stock?',
  },
  {
    icon: CreditCard,
    label: 'Price & details',
    query: 'How much is Boom Wash P00481?',
  },
  {
    icon: Truck,
    label: 'Delivery info',
    query: 'Cash on delivery puluwanda? Delivery fee kiyada?',
  },
];

export const NookiChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
    if (isOpen && window.innerWidth >= 640) {
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isLoading]);

  const handleResetConversation = () => {
    const newSession = `nooki-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('nooki_session_id', newSession);
    }
    setSessionId(newSession);
    setMessages([]);
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
        text: data.reply || data.error || "I'm sorry, I couldn't reach the server. Please try again shortly!",
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
          text: 'Network connection issue. Please check your internet or reach us via WhatsApp (+94 71 489 7262).',
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
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold underline underline-offset-2 break-all my-0.5"
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
    <div
      aria-label="Nooki Store Chat Assistant"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999] pointer-events-none select-none"
    >
      {/* ---------------- CHAT WINDOW ---------------- */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Nooki Shopping Assistant"
          className="pointer-events-auto fixed inset-x-3 bottom-3 top-16 sm:static sm:w-[410px] sm:h-[580px] sm:max-h-[85vh] bg-white rounded-[26px] shadow-2xl border border-emerald-950/15 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 origin-bottom-right duration-200"
        >
          {/* Header */}
          <div className="bg-[#004D40] text-white px-4 py-3 flex items-center justify-between shadow-xs shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-emerald-700/60 flex items-center justify-center p-0.5 border border-emerald-400/40 shrink-0">
                <Image
                  src="/nookmint_images/moskot.png"
                  alt="Nooki Mascot"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#004D40] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white tracking-wide">Nooki Assistant</h3>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#059669] text-white font-semibold">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90 leading-tight">
                  Your shopping buddy at NookMint
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-emerald-200/90">
              {messages.length > 0 && (
                <button
                  onClick={handleResetConversation}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:text-white hover:bg-emerald-800/60 active:scale-95 transition-all cursor-pointer"
                  title="Reset conversation"
                  aria-label="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:text-white hover:bg-emerald-800/60 active:scale-95 transition-all cursor-pointer"
                title="Minimize chat"
                aria-label="Minimize chat window"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:text-white hover:bg-emerald-800/60 active:scale-95 transition-all cursor-pointer"
                title="Close chat"
                aria-label="Close chat window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-[#EBF5EE] via-[#F4F9F5] to-white flex flex-col">
            {messages.length === 0 ? (
              /* Welcome Hero View (Matching Mockup 1:1) */
              <div className="flex-1 flex flex-col items-center justify-between p-4 text-center">
                {/* Large Mascot Illustration */}
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 my-auto shrink-0 drop-shadow-md">
                  <Image
                    src="/nookmint_images/moskot.png"
                    alt="Nooki Friendly Robot Mascot"
                    width={180}
                    height={180}
                    priority
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Speech Bubble Card */}
                <div className="bg-white/95 rounded-2xl p-4 shadow-xs border border-emerald-100/90 w-full mb-3 text-center">
                  <h4 className="font-extrabold text-[15px] text-slate-900 flex items-center justify-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100/90 flex items-center justify-center text-emerald-700 shrink-0">
                      <Sparkles className="w-3 h-3 text-emerald-700" />
                    </span>
                    <span>Hi there! I&apos;m Nooki!</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Ask me about products, prices, stock availability, or Cash on Delivery across Sri Lanka.
                  </p>
                </div>

                {/* 2x2 Quick Action Pills Grid */}
                <div className="grid grid-cols-2 gap-2 w-full">
                  {QUICK_ACTIONS.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(item.query)}
                        className="bg-white hover:bg-emerald-50/80 text-slate-800 hover:text-emerald-900 border border-emerald-200/90 rounded-xl py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:scale-101 active:scale-[0.96] cursor-pointer"
                      >
                        <IconComponent className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Conversation Messages Stream */
              <div className="flex-1 p-4 space-y-3.5">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 items-start ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300/60 p-0.5 mt-0.5">
                          <Image
                            src="/nookmint_images/moskot.png"
                            alt="Nooki"
                            width={28}
                            height={28}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}
                      >
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line shadow-2xs ${
                            isUser
                              ? 'bg-[#004D40] text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-emerald-100/90 rounded-bl-xs'
                          }`}
                        >
                          {renderMessageContent(msg.text)}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300/60 p-0.5">
                      <Image
                        src="/nookmint_images/moskot.png"
                        alt="Nooki"
                        width={28}
                        height={28}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-1 px-3 py-2 bg-white border border-emerald-100 rounded-2xl rounded-bl-xs text-slate-400 shadow-2xs">
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Box Area */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 rounded-full px-4 py-1.5 border border-slate-200/90 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-600/10 transition-all shadow-2xs">
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
                className="p-2 bg-[#004D40] hover:bg-[#00382E] text-white rounded-full disabled:opacity-30 disabled:hover:bg-[#004D40] transition-all shadow-2xs shrink-0 active:scale-90 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-2 text-[10.5px] text-slate-600 font-medium select-none">
              <span className="flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Supports Singlish &amp; Sinhala queries</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% Cash on Delivery</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- FLOATING LAUNCHER BUTTON (Visible ONLY when minimized) ---------------- */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-expanded={false}
          aria-label="Open Nooki shopping assistant chat"
          className="pointer-events-auto group relative flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 bg-gradient-to-r from-[#00382E] via-[#004D40] to-[#015C4D] hover:from-[#004438] hover:via-[#005749] hover:to-[#016B59] text-white font-extrabold text-[13px] rounded-full shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_12px_28px_-4px_rgba(0,77,64,0.5),0_6px_12px_-4px_rgba(0,77,64,0.3)] hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_16px_36px_-6px_rgba(0,77,64,0.6)] border border-emerald-400/50 hover:border-emerald-300/80 transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.96] select-none cursor-pointer"
        >
          {/* 3D Mascot Avatar Badge with Overlap */}
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-b from-white via-white to-emerald-50/90 flex items-center justify-center p-1 shrink-0 shadow-md border-2 border-white/95 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300 ease-out">
            <Image
              src="/nookmint_images/moskot.png"
              alt="Nooki Mascot"
              width={40}
              height={40}
              className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,77,64,0.15)]"
            />

            {/* Pulsing Live Online Beacon at Top-Right */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-white shadow-2xs" />
            </span>
          </div>

          {/* Button Text */}
          <div className="flex flex-col items-start leading-tight pr-0.5">
            <span className="tracking-wide font-extrabold text-white text-[13px] drop-shadow-xs flex items-center gap-1.5">
              <span>Ask Nooki</span>
              <Leaf className="w-3.5 h-3.5 text-emerald-300 group-hover:rotate-12 transition-transform duration-300 shrink-0" />
            </span>
            <span className="text-[10px] text-emerald-200/90 font-medium tracking-normal -mt-0.5">
              Online Assistant
            </span>
          </div>

          {/* Shimmer sweep effect */}
          <span
            className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
            aria-hidden="true"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out" />
          </span>
        </button>
      )}
    </div>
  );
};
