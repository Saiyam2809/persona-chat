"use client";

import React from "react";
import { PERSONAS } from "@/lib/constants";
import { Persona } from "@/types/chat";
import PersonaCard from "./PersonaCard";

interface PersonaSelectorProps {
  selectedPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

export default function PersonaSelector({
  selectedPersona,
  onPersonaChange,
}: PersonaSelectorProps) {
  return (
    <div className="persona-selector" role="group" aria-label="Select a persona">
      {PERSONAS.map((persona) => (
        <PersonaCard
          key={persona.id}
          persona={persona}
          isActive={selectedPersona === persona.id}
          onClick={() => onPersonaChange(persona.id)}
        />
      ))}
    </div>
  );
}
