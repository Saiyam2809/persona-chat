"use client";

import React, { useRef, useEffect } from "react";
import { Message } from "@/types/chat";
import MessageBubble from "./MessageBubble";
import { PersonaInfo } from "@/types/chat";

interface ChatMessageProps {
  messages: Message[];
  persona: PersonaInfo;
}

export default function ChatMessage({ messages, persona }: ChatMessageProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="messages-list">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} persona={persona} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
