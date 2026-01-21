import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { Bot, User, Mic, MicOff } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  isListening: boolean;
  isSpeaking: boolean;
  onToggleListening: () => void;
  onStopSpeaking: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isListening,
  isSpeaking,
  onToggleListening,
  onStopSpeaking
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-float">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h2 className="font-bold text-white tracking-wide">Vibe AI</h2>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span className="text-xs text-slate-400 font-medium">
                {isSpeaking ? 'Speaking...' : 'Online'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-8 opacity-60">
            <Bot size={48} className="mb-4 text-purple-500/50" />
            <p className="text-lg font-medium">Tap the mic to start cooking!</p>
            <p className="text-sm mt-2">"Help me build a header"</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-lg backdrop-blur-sm ${
                msg.role === 'user'
                  ? 'bg-purple-600/90 text-white rounded-tr-none'
                  : 'bg-slate-700/80 text-blue-100 rounded-tl-none border border-white/5'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Voice Controls */}
      <div className="p-4 bg-white/5 border-t border-white/10 flex justify-center relative">
        {/* Visualizer Ring */}
        {isListening && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-purple-500/20 rounded-full animate-pulse-fast"></div>
        )}
        
        <button
          onClick={onToggleListening}
          className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 scale-110' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105'
          }`}
        >
          {isListening ? (
             <MicOff className="text-white" size={28} />
          ) : (
             <Mic className="text-white" size={28} />
          )}
        </button>

        {isSpeaking && (
          <button 
            onClick={onStopSpeaking}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-slate-800 text-white px-3 py-1 rounded-full border border-white/10 hover:bg-slate-700"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
};
