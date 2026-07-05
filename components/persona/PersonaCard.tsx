"use client";

import React from "react";
import Image from "next/image";
import { PersonaInfo } from "@/types/chat";

interface PersonaCardProps {
  persona: PersonaInfo;
  isActive: boolean;
  onClick: () => void;
}

export default function PersonaCard({
  persona,
  isActive,
  onClick,
}: PersonaCardProps) {
  return (
    <button
      onClick={onClick}
      className={`persona-card ${isActive ? "persona-card-active" : ""}`}
      aria-pressed={isActive}
      id={`persona-card-${persona.id}`}
    >
      <Image
        src={persona.avatar}
        alt={persona.name}
        width={56}
        height={56}
        className="persona-card-avatar"
      />
      <div className="persona-card-info">
        <span className="persona-card-name">{persona.name}</span>
        <span className="persona-card-desc">{persona.description}</span>
      </div>
      {isActive && <div className="persona-card-check">✓</div>}
    </button>
  );
}
