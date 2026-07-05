"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PERSONAS } from "@/lib/constants";
import { Persona, PersonaInfo } from "@/types/chat";
import { MessageSquare } from "lucide-react";

interface SidebarProps {
  selectedPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

function PersonaItem({
  persona,
  isActive,
  onClick,
}: {
  persona: PersonaInfo;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`persona-item ${isActive ? "active" : ""}`}
      aria-pressed={isActive}
    >
      <div className="persona-avatar-wrap">
        <Image
          src={persona.avatar}
          alt={persona.name}
          width={44}
          height={44}
          className="persona-avatar-img"
        />
        <span
          className={`persona-status-dot ${isActive ? "online" : "offline"}`}
        />
      </div>
      <div className="persona-info">
        <span className="persona-name">{persona.name}</span>
        <span className="persona-desc">{persona.description}</span>
      </div>
      {isActive && <span className="persona-active-pill">Active</span>}
    </button>
  );
}

export default function Sidebar({
  selectedPersona,
  onPersonaChange,
  isOpen = true,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <MessageSquare size={20} strokeWidth={2} />
          </div>
          <span className="sidebar-logo-text">AI Persona</span>
        </div>

        <div className="sidebar-divider" />

        {/* Section label */}
        <p className="sidebar-section-label">Choose Persona</p>

        {/* Persona list */}
        <nav className="sidebar-nav" aria-label="Persona selection">
          {PERSONAS.map((persona) => (
            <PersonaItem
              key={persona.id}
              persona={persona}
              isActive={selectedPersona === persona.id}
              onClick={() => {
                onPersonaChange(persona.id);
                onClose?.();
              }}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-badge">
            <span className="sidebar-footer-dot" />
            <span>Powered by AI</span>
          </div>
        </div>
      </aside>
    </>
  );
}
