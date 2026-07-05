"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Persona } from "@/types/chat";

interface MainLayoutProps {
  children: React.ReactNode;
  selectedPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

export default function MainLayout({
  children,
  selectedPersona,
  onPersonaChange,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        selectedPersona={selectedPersona}
        onPersonaChange={onPersonaChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="app-main">
        <Header
          selectedPersona={selectedPersona}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
