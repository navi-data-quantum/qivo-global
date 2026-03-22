"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";

export default function ChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, text]);
    setText("");
  };

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
      {isOpen && (
        <div
          style={{
            width: 360,
            height: 500,
            backgroundColor: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#0078ff",
              color: "#fff",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Chat
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
          </div>
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              padding: 10,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#f1f1f1",
                  alignSelf: "flex-start",
                  padding: "8px 12px",
                  borderRadius: 10,
                  maxWidth: "80%",
                }}
              >
                {m}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              padding: 10,
              borderTop: "1px solid #eee",
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ccc",
                marginRight: 8,
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                backgroundColor: "#0078ff",
                border: "none",
                borderRadius: 8,
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Send size={20} color="#fff" />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          backgroundColor: "#0078ff",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Send size={28} color="#fff" />
      </button>
    </div>
  );
}