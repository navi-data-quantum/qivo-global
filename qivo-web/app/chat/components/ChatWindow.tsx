"use client";

import { useEffect, useRef } from "react";

interface Message {
  id: number;
  senderId: number;
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`mb-2 ${
            msg.senderId === 1 ? "text-right" : "text-left"
          }`}
        >
          <span className="inline-block bg-blue-200 p-2 rounded">
            {msg.content}
          </span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}