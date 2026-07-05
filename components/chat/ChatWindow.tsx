"use client";

import React, { useRef, useEffect } from "react";
import { Message, PersonaInfo } from "@/types/chat";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "./EmptyState";

interface ChatWindowProps {
  messages: Message[];
  persona: PersonaInfo;
  isLoading: boolean;
  onExampleClick: (prompt: string) => void;
}

export default function ChatWindow({
  messages,
  persona,
  isLoading,
  onExampleClick,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  return (
    <div className="chat-window" id="chat-window">
      {isEmpty && !isLoading ? (
        <EmptyState persona={persona} onExampleClick={onExampleClick} />
      ) : (
        <div className="messages-list">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} persona={persona} />
          ))}
          {isLoading && <TypingIndicator persona={persona} />}
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
