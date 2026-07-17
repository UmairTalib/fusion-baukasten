"use client";

import { Send, Sparkles, User as UserIcon } from "lucide-react";
import { useState } from "react";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

export function Copilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hallo Umair! Lass uns mit Block A: Grundlagen & Ziele beginnen. Was ist das grobe Ziel eures Beteiligungsprojekts?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add User Message
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: input },
    ]);
    
    // Simulate AI Response (To be wired to backend later)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "Verstanden. Ich habe das Ziel in das Arbeitsblatt drüben eingetragen. Welche Zielgruppe möchtet ihr hauptsächlich ansprechen?",
        },
      ]);
    }, 1000);
    
    setInput("");
  };

  return (
    <aside className="fixed inset-y-0 left-[260px] z-15 w-[348px] flex flex-col bg-fusion-bg border-r border-fusion-line shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 h-[72px] px-6 border-b border-fusion-line bg-white/50 backdrop-blur-sm">
        <div className="p-2 bg-fusion-purple/10 text-fusion-purple rounded-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-fusion-text">Fusion KI-Assistent</h2>
          <p className="text-xs font-medium text-fusion-green flex items-center gap-1 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-fusion-green animate-pulse"></span>
            Online & bereit
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-[90%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "ai" ? "bg-gradient-to-br from-fusion-purple to-fusion-purpleDark text-white shadow-md" : "bg-fusion-panelSoft text-fusion-muted"}`}>
              {msg.role === "ai" ? <Sparkles className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </div>
            <div className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${msg.role === "user" ? "bg-white text-fusion-text rounded-tr-sm border border-fusion-line" : "bg-white text-fusion-text rounded-tl-sm border border-fusion-line/50"}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-fusion-line">
        <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-fusion-bg rounded-xl border border-fusion-line p-2 focus-within:border-fusion-purple/50 focus-within:ring-4 focus-within:ring-fusion-purple/10 transition-all">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Antworte der KI..."
            className="w-full bg-transparent border-none focus:outline-none resize-none max-h-32 min-h-[44px] text-sm py-3 px-2"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="p-3 bg-fusion-purple text-white rounded-lg hover:bg-fusion-purpleDark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shrink-0 mb-0.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-fusion-muted mt-3 font-medium">
          KI-Agenten können Fehler machen. Überprüfe die Eingaben.
        </p>
      </div>
    </aside>
  );
}
