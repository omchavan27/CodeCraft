import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, Shield, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage } from "../types";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init",
      sender: "bot",
      text: "Namste! I am your digital growth assistant.Looking to get more walk-ins ,increase addmision, or launch a premium websites for your bussiness? Let's explore. May I begin with your name?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState({
    name: null,
    email: null,
    projectScope: null,
    budget: null,
  });
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");

    const userMessage: ChatMessage = {
      id: "msg_user_" + Date.now().toString(36),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Send trailing 10 messages to limit prompt length but preserve deep context
          messages: updatedMessages.slice(-10).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) throw new Error("Connection timed out.");
      const data = await response.json();

      const botMessage: ChatMessage = {
        id: "msg_bot_" + Date.now().toString(36),
        sender: "bot",
        text: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);

      if (data.extractedDetails) {
        setExtractedInfo((prev) => ({
          ...prev,
          ...data.extractedDetails,
        }));
      }

      if (data.leadCaptured) {
        setLeadCaptured(true);
        if (data.leadId) {
          setLeadId(data.leadId);
        }
      }
    } catch (err: any) {
      console.error("Chat error", err);
      setMessages((prev) => [
        ...prev,
        {
          id: "msg_err_" + Date.now(),
          sender: "bot",
          text: "Intake routing anomaly detected. Please submit your specifications directly through our validated Contact console.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="chatbot-widget-container" className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Mini Toggle floating launcher */}
      <motion.button
        id="chatbot-widget-launcher"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`group relative flex items-center justify-center p-4 rounded-full bg-gradient-to-tr from-[#66FCF1] via-[#1F2833] to-[#1F2833] border-2 border-[#66FCF1] text-[#0B0C10] hover:text-white shadow-[0_0_20px_rgba(102,252,241,0.4)] cursor-pointer`}
      >
        <span className="absolute inset-0 rounded-full bg-[#66FCF1] blur-md opacity-25 group-hover:opacity-45 transition-duration-300 pointer-events-none" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <X size={24} className="relative z-10" />
          ) : (
            <MessageSquare size={24} className="relative z-10 animate-pulse" />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Main chat layout */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-widget-popup"
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute bottom-20 right-0 w-[410px] sm:w-[430px] h-[550px] flex flex-col rounded-2xl bg-[#0B0C10]/95 border border-[#1F2833] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#1F2833] to-[#0D151E] border-b border-[#1F2833] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-[#0B0C10] border border-[#66FCF1]/40">
                  <Bot size={20} className="text-[#66FCF1]" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0B0C10]" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-semibold tracking-wide uppercase flex items-center gap-1.5">
                    AURION ASSISTANT 
                    <span className="text-[10px] text-[#66FCF1] font-mono lowercase border border-[#66FCF1]/30 px-1 rounded">active</span>
                  </h4>
                 
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 px-2.5 rounded hover:bg-[#1F2833] text-[#C5C6C7] hover:text-white font-mono text-xs transition-colors cursor-pointer"
              >
                Exit
              </button>
            </div>

            

            {/* Message window */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {messages.map((message) => {
                const isUser = message.sender === "user";
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded bg-[#1F2833] border border-[#66FCF1]/30 flex items-center justify-center shrink-0 mt-1">
                        <Sparkles size={13} className="text-[#66FCF1]" />
                      </div>
                    )}
                    <div className="max-w-[78%]">
                      <div
                        className={`p-3.5 rounded-xl text-sm leading-relaxed ${
                          isUser
                            ? "bg-[#66FCF1] text-[#0B0C10] font-medium rounded-tr-none shadow-[0_4px_15px_rgba(102,252,241,0.2)]"
                            : "bg-[#1F2833] text-white rounded-tl-none border border-[#1F2833]"
                        }`}
                      >
                        {message.text}
                      </div>
                      <span className={`block text-[10px] mt-1 text-gray-500 font-mono ${isUser ? "text-right" : "text-left"}`}>
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded bg-[#1F2833] border border-[#66FCF1]/30 flex items-center justify-center shrink-0 mt-1">
                    <Loader2 size={13} className="text-[#66FCF1] animate-spin" />
                  </div>
                  <div className="max-w-[70%] bg-[#1F2833]/80 border border-[#1F2833] p-3 rounded-xl rounded-tl-none flex items-center gap-2">
                    <span className="text-xs text-[#C5C6C7] font-mono tracking-wider uppercase">Decoding specs...</span>
                  </div>
                </div>
              )}

              {leadCaptured && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-[#1F2833]/50 border border-[#66FCF1]/40 rounded-xl space-y-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-[#66FCF1]/10 text-[#66FCF1] font-mono text-[9px] px-2 py-0.5 uppercase tracking-widest border-l border-b border-[#66FCF1]/20">
                    Synchronized
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
                    <h5 className="font-semibold text-white text-sm">System Intake Complete</h5>
                  </div>
                  <p className="text-xs text-[#C5C6C7] leading-relaxed">
                    Your details have been successfully serialized and linked directly with the secure CRM. Automated onboarding sequence fired.
                  </p>
                  <div className="text-[10px] bg-[#0B0C10] p-2 rounded border border-[#1F2833] font-mono text-gray-400 select-all">
                    System ID: <span className="text-[#66FCF1]">{leadId || "processing..."}</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer Input */}
            <form onSubmit={handleSend} className="p-3 bg-[#0D1117] border-t border-[#1F2833] flex items-center gap-2">
              <input
                type="text"
                disabled={leadCaptured || isLoading}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={leadCaptured ? "Spec analysis synced successfully." : "Enter transmission..."}
                className="flex-1 px-4 py-2.5 text-sm bg-[#0B0C10] border border-[#1F2833] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#66FCF1]/60 focus:ring-1 focus:ring-[#66FCF1]/40 disabled:opacity-50 transition-all font-mono"
              />
              <button
                type="submit"
                disabled={leadCaptured || isLoading || !input.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-tr from-[#66FCF1] to-[#66FCF1]/80 hover:brightness-110 text-[#0B0C10] focus:outline-none disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-[0_2px_10px_rgba(102,252,241,0.2)]"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
