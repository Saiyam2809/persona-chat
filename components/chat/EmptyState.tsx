"use client";

import React from "react";
import Image from "next/image";
import { PersonaInfo } from "@/types/chat";
import { EXAMPLE_PROMPTS } from "@/lib/constants";

interface EmptyStateProps {
  persona: PersonaInfo;
  onExampleClick: (prompt: string) => void;
}

export default function EmptyState({
  persona,
  onExampleClick,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-wave">👋</div>
      <h2 className="empty-title">Ask anything...</h2>
      <p className="empty-subtitle">
        Currently talking with{" "}
        <span className="empty-persona-name">{persona.name}</span>
      </p>

      {/* Persona avatar */}
      <div className="empty-avatar-wrap">
        <Image
          src={persona.avatar}
          alt={persona.name}
          width={80}
          height={80}
          className="empty-avatar"
        />
        <div className="empty-avatar-ring" />
      </div>

      {/* Example prompts */}
      <div className="empty-examples">
        <p className="empty-examples-label">Try asking:</p>
        <div className="empty-prompts">
          {(EXAMPLE_PROMPTS[persona.id] || []).map((prompt) => (
            <button
              key={prompt}
              className="empty-prompt-btn"
              onClick={() => onExampleClick(prompt)}
              id={`example-prompt-${prompt.replace(/\s+/g, "-").toLowerCase()}`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
