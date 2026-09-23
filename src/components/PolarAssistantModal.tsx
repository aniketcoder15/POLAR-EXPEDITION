import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  RotateCcw, 
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { 
  Personnel, 
  Expedition, 
  Vehicle, 
  CargoItem, 
  InventoryItem, 
  Emergency, 
  Camp 
} from '../types';
import { generateAssistantResponse, AssistantDataSources } from '../services/polarAssistant';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface PolarAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: Personnel[];
  expeditions: Expedition[];
  vehicles: Vehicle[];
  cargo: CargoItem[];
  inventory: InventoryItem[];
  emergencies: Emergency[];
  camps?: Camp[];
}

const SUGGESTED_QUESTIONS = [
  "How many personnel are active?",
  "Are there any active emergencies?",
  "What inventory items are low/critical?",
  "Which vehicles are active?",
  "What is the expedition status?",
  "Where is Dr. Evelyn Vance?"
];

export const PolarAssistantModal: React.FC<PolarAssistantModalProps> = ({
  isOpen,
  onClose,
  personnel,
  expeditions,
  vehicles,
  cargo,
  inventory,
  emergencies,
  camps
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Polar Assistant active. Ask about personnel, expeditions, vehicles, cargo, inventory, or emergencies.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToBottom();
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputValue).trim();
    if (!query) return;

    // Reset input immediately to avoid duplicate submits
    setInputValue('');

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: timeStr
    };

    // Generate local response from live data
    const dataSources: AssistantDataSources = {
      personnel,
      expeditions,
      vehicles,
      cargo,
      inventory,
      emergencies,
      camps
    };

    const replyText = generateAssistantResponse(query, dataSources);

    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now() + 1}`,
      sender: 'assistant',
      text: replyText,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="polar-assistant-container"
        className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-[9999] w-[calc(100vw-1.5rem)] sm:w-[420px] h-[520px] max-h-[82vh] flex flex-col rounded-2xl bg-[#FFFCF8] border border-[#EAE3D5] shadow-2xl warm-card-shadow overflow-hidden text-[#24313A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-[#FFFBF5] border-b border-[#EAE3D5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFE5C7] to-[#F29A3D]/25 border border-[#F29A3D]/40 flex items-center justify-center text-[#C96A20]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-xs tracking-tight text-[#24313A] font-display">
                  Polar Assistant
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#EBF7F0] border border-[#39A96B]/30 text-[9px] font-bold text-[#39A96B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39A96B] animate-pulse" />
                  Local Live
                </span>
              </div>
              <p className="text-[10px] text-[#71808A]">Operations Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="clear-chat-btn"
              onClick={handleClearChat}
              title="Clear chat history"
              className="p-1.5 rounded-lg text-[#71808A] hover:text-[#24313A] hover:bg-[#F7F4EF] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button
              id="close-chat-btn"
              onClick={onClose}
              title="Close Assistant"
              className="p-1.5 rounded-lg text-[#71808A] hover:text-[#24313A] hover:bg-[#F7F4EF] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FAF8F5]/60 text-xs">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#71808A]">
              <div className="w-10 h-10 rounded-full bg-[#FFE5C7]/50 border border-[#F29A3D]/30 flex items-center justify-center text-[#C96A20] mb-2.5">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[#24313A]">Chat Cleared</p>
              <p className="text-[11px] mt-1 text-[#71808A]">
                Ask any question below or select a suggested topic.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[88%] rounded-2xl p-3 shadow-xs ${
                      isUser
                        ? 'bg-[#F29A3D] text-[#24313A] font-medium rounded-br-xs'
                        : 'bg-[#FFFCF8] text-[#24313A] border border-[#EAE3D5] rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed text-[11.5px] font-sans break-words">
                      {msg.text}
                    </div>
                  </div>
                  <span className="text-[9px] text-[#A0AEC0] mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Questions */}
        <div className="px-3 py-2 bg-[#FFFBF5] border-t border-[#EAE3D5]/80 overflow-x-auto shrink-0 flex items-center gap-1.5 no-scrollbar">
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#71808A] shrink-0 mr-1">
            <HelpCircle className="w-3 h-3 text-[#C96A20]" />
            <span>Ask:</span>
          </div>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="shrink-0 px-2 py-1 rounded-lg bg-[#FFFCF8] hover:bg-[#FFE5C7] hover:border-[#F29A3D]/40 border border-[#EAE3D5] text-[10.5px] font-medium text-[#24313A] transition-all cursor-pointer shadow-2xs whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-2.5 bg-[#FFFCF8] border-t border-[#EAE3D5] flex items-center gap-2 shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about personnel, expeditions, cargo, supplies..."
            className="flex-1 bg-[#F7F4EF] border border-[#EAE3D5] rounded-xl px-3 py-2 text-xs text-[#24313A] placeholder-[#71808A] focus:outline-hidden focus:border-[#F29A3D] focus:ring-1 focus:ring-[#F29A3D]/30 transition-all"
          />
          <button
            id="send-chat-message-btn"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim()}
            className="p-2 rounded-xl bg-[#F29A3D] hover:bg-[#E08A2D] disabled:opacity-40 disabled:cursor-not-allowed text-[#24313A] font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center shrink-0"
            title="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AnimatePresence>
  );
};
