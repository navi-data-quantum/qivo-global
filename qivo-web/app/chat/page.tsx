"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";

interface Message {
  id: number;
  senderId: number;
  content: string;
}

export default function FloatingChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, senderId: 2, content: "Hello! How can I help you today?" },
  ]);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    const newMessage: Message = {
      id: messages.length + 1,
      senderId: 1,
      content: text,
    };
    setMessages((prev) => [...prev, newMessage]);
    setText("");
    setTimeout(() => {
      const reply: Message = {
        id: messages.length + 2,
        senderId: 2,
        content: "Thanks for your message! We'll get back to you shortly.",
      };
      setMessages((prev) => [...prev, reply]);
    }, 1000);
  };

  return (
    <>
      <div
        className={`fixed bottom-4 right-4 flex flex-col border rounded shadow-lg bg-white ${
          open ? "w-80 h-96" : "w-16 h-16"
        } transition-all duration-300`}
      >
        {open ? (
          <>
            <div className="bg-blue-500 text-white p-3 font-bold flex justify-between items-center">
              Chat
              <button onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div
              ref={scrollRef}
              className="flex-1 p-2 overflow-y-auto flex flex-col gap-2 bg-gray-50"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[70%] p-2 rounded-lg ${
                    msg.senderId === 1
                      ? "bg-blue-500 text-white self-end"
                      : "bg-gray-200 self-start"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
            <div className="flex p-2 border-t bg-white">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 border rounded-l px-3 py-1 outline-none"
              />
              <button
                onClick={handleSend}
                className="bg-blue-500 p-2 rounded-r flex items-center justify-center text-white"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="w-full h-full flex items-center justify-center bg-blue-500 text-white rounded-full"
          >
            Chat
          </button>
        )}
      </div>
    </>
  );
}