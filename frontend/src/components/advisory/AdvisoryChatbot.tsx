import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { ChatMessage } from '../../types';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    sender: 'assistant',
    text: "Welcome to LifeSure Advisory Assistant. I can provide objective, commission-free guidance on policy categories (Term, Whole Life, Endowment, ULIPs), inflation discounting mechanics, or our Capital Needs methodology. What can I clarify for you?",
    suggested_followups: [
      "Why is Term Life recommended over Endowment?",
      "How does inflation erode future insurance payouts?",
      "What is the Fisher real discount rate formula?",
      "Can I reduce my need with existing 401(k) assets?",
    ],
    timestamp: new Date(),
  },
];

export const AdvisoryChatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.sendChatMessage(textToSend);
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        suggested_followups: response.suggested_followups,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I am unable to connect to the knowledgebase right now. You can consult our methodology documents or schedule a live review with a licensed CFP®.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md sm:max-w-lg shadow-xl rounded-sm bg-white border border-[#E6E4DF] overflow-hidden flex flex-col h-[560px] animate-in slide-in-from-bottom-5 duration-200">
      
      {/* Header */}
      <div className="bg-[#FAF9F5] border-b border-[#E6E4DF] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1D4ED8]/10 border border-[#1D4ED8]/20 text-[#1D4ED8] flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="font-serif text-sm font-medium text-[#0B132B]">LifeSure Advisory AI</h3>
              <span className="w-2 h-2 rounded-full bg-[#047857]"></span>
            </div>
            <p className="text-[10px] font-mono text-[#64748B]">Deterministic Actuarial Education</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#64748B] hover:text-[#0B132B] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#FAF9F5] text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <span className="text-[10px] font-mono text-[#64748B] mb-1">
              {msg.sender === 'user' ? 'You' : 'Advisory AI'}
            </span>
            <div
              className={`p-3.5 rounded-sm max-w-[88%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#0B132B] text-white'
                  : 'bg-white border border-[#E6E4DF] text-[#0B132B] shadow-xs'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Follow-up question chips */}
              {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#E6E4DF]/60 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block">
                    Suggested Exploration:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggested_followups.map((f, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(f)}
                        className="text-[11px] font-mono text-left px-2.5 py-1 rounded-sm bg-[#FAF9F5] hover:bg-[#1D4ED8] hover:text-white border border-[#E6E4DF] text-[#0B132B] transition-colors"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs font-mono text-[#64748B] p-2 bg-white border border-[#E6E4DF] rounded-sm max-w-[200px]">
            <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-ping"></span>
            <span>Consulting actuarial engine...</span>
          </div>
        )}
      </div>

      {/* Input Footer */}
      <div className="p-3 bg-white border-t border-[#E6E4DF] flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about formulas, term vs whole life, or riders..."
          className="flex-1 px-3 py-2 text-xs bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] text-[#0B132B]"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || loading}
          className="p-2 bg-[#0B132B] hover:bg-[#1D4ED8] disabled:opacity-40 text-white rounded-sm transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
