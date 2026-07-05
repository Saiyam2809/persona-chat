"use client";

import React from "react";
import Image from "next/image";
import { PERSONAS } from "@/lib/constants";
import { Persona } from "@/types/chat";
import { Menu, Sparkles } from "lucide-react";

interface HeaderProps {
  selectedPersona: Persona;
  onMenuToggle: () => void;
}

export default function Header({ selectedPersona, onMenuToggle }: HeaderProps) {
  const persona = PERSONAS.find((p) => p.id === selectedPersona)!;

  return (
    <header className="chat-header">
      {/* Mobile menu button */}
      <button
        className="header-menu-btn"
        onClick={onMenuToggle}
        aria-label="Toggle sidebar"
        id="menu-toggle-btn"
      >
        <Menu size={20} />
      </button>

      {/* Persona info */}
      <div className="header-persona">
        <div className="header-avatar-wrap">
          <Image
            src={persona.avatar}
            alt={persona.name}
            width={40}
            height={40}
            className="header-avatar-img"
          />
          <span className="header-status-dot" />
        </div>
        <div className="header-persona-info">
          <h1 className="header-persona-name">{persona.name}</h1>
          <p className="header-persona-desc">{persona.description}</p>
        </div>
      </div>

      {/* Right badge */}
      <div className="header-badge">
        <Sparkles size={14} />
        <span>AI</span>
      </div>
    </header>
  );
}
