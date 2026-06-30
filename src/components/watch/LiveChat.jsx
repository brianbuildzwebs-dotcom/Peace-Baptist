import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LiveChat() {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState(() => localStorage.getItem("chat_name") || "");
  const [text, setText] = useState("");
  const [nameSet, setNameSet] = useState(() => !!localStorage.getItem("chat_name"));
  const [tempName, setTempName] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.entities.LiveChat.list("-created_date", 50)
      .then((msgs) => setMessages(msgs.reverse()))
      .catch(() => {});

    const unsub = base44.entities.LiveChat.subscribe((event) => {
      if (event.type === "create" && event.data) {
        setMessages((prev) => [...prev, event.data]);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSetName = (e) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    localStorage.setItem("chat_name", tempName.trim());
    setName(tempName.trim());
    setNameSet(true);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !name) return;
    const msg = text.trim();
    setText("");
    await base44.entities.LiveChat.create({ sender_name: name, message: msg });
  };

  if (!nameSet) {
    return (
      <div className="bg-navy-light rounded-2xl p-6 border border-white/5 flex flex-col h-full min-h-[400px] items-center justify-center">
        <MessageCircle size={32} className="text-gold mb-4" />
        <h3 className="font-heading text-white text-lg font-bold mb-2">Join the Live Chat</h3>
        <p className="text-white/50 text-sm mb-6 text-center">Enter your name to join the conversation during service.</p>
        <form onSubmit={handleSetName} className="w-full space-y-3">
          <input
            autoFocus
            type="text"
            placeholder="Your first name..."
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm"
          />
          <button type="submit" className="w-full py-3 bg-gold text-navy font-bold rounded-xl hover:bg-gold-light text-sm">
            Join Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-navy-light rounded-2xl border border-white/5 flex flex-col h-full min-h-[400px]">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <h3 className="font-heading text-white text-sm font-bold">Live Chat</h3>
        <span className="text-white/30 text-xs ml-auto">Chatting as {name}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-72">
        {messages.length === 0 && (
          <p className="text-white/30 text-xs text-center mt-8">Be the first to say something! 👋</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender_name === name ? "items-end" : "items-start"}`}>
            <span className="text-white/30 text-xs mb-1">{msg.sender_name}</span>
            <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${msg.sender_name === name ? "bg-gold text-navy font-medium" : "bg-white/10 text-white"}`}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="px-4 pb-4 pt-2 border-t border-white/5 flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm"
        />
        <button type="submit" disabled={!text.trim()} className="px-4 py-2.5 bg-gold text-navy rounded-xl hover:bg-gold-light disabled:opacity-40 transition-all">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}