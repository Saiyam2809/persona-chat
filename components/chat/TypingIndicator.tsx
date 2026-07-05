"use client";

import React from "react";
import Image from "next/image";
import { PersonaInfo } from "@/types/chat";

interface TypingIndicatorProps {
  persona: PersonaInfo;
}

export default function TypingIndicator({ persona }: TypingIndicatorProps) {
  return (
    <div className="message-row message-row-assistant">
      <div className="message-avatar-wrap">
        <Image
          src={persona.avatar}
          alt={persona.name}
          width={36}
          height={36}
          className="message-avatar"
        />
      </div>
      <div className="message-bubble bubble-assistant typing-bubble">
        <span className="message-sender-name">{persona.name}</span>
        <div className="typing-dots" aria-label="Typing...">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
