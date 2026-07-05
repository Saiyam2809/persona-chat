"use client";

import React, { useState, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";
import { Message, Persona } from "@/types/chat";
import { PERSONAS } from "@/lib/constants";

// ─── Initial state ────────────────────────────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  {
    id: "init-1",
    role: "assistant",
    content: "Hi! I'm ready to help. Ask me anything about web development.",
    timestamp: new Date(),
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [selectedPersona, setSelectedPersona] = useState<Persona>("hitesh");
  const [messagesByPersona, setMessagesByPersona] = useState<
    Record<Persona, Message[]>
  >({
    hitesh: [...INITIAL_MESSAGES],
    piyush: [],
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentPersonaInfo = PERSONAS.find((p) => p.id === selectedPersona)!;
  const messages = messagesByPersona[selectedPersona];

  // ── Handle persona switch ──────────────────────────────────────────────────
  const handlePersonaChange = useCallback((persona: Persona) => {
    setSelectedPersona(persona);
    setInput("");
    setIsLoading(false);
  }, []);

  // ── Send/Stream message handler ────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string, persona: Persona) => {
    const cleanText = text.trim();
    if (!cleanText || isLoading) return;

    setInput("");
    setIsLoading(true);

    // Snapshot history BEFORE adding new messages
    const currentHistory = messagesByPersona[persona];

    // Create message objects
    const userMsg: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: "user",
      content: cleanText,
      timestamp: new Date(),
    };

    const assistantMsgId = `assistant-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const assistantMsgPlaceholder: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    // Update state to render user message and empty typing bubble
    setMessagesByPersona((prev) => ({
      ...prev,
      [persona]: [...prev[persona], userMsg, assistantMsgPlaceholder],
    }));

    // Build payload including the new user message
    const apiMessages = [
      ...currentHistory.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: cleanText },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, persona }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? "Failed to get response.");
      }

      // Parse sources from response header (if any)
      const sourcesHeader = res.headers.get("x-sources");
      const sources = sourcesHeader ? JSON.parse(sourcesHeader) : undefined;

      if (sources) {
        setMessagesByPersona((prev) => ({
          ...prev,
          [persona]: prev[persona].map((m) =>
            m.id === assistantMsgId ? { ...m, sources } : m
          ),
        }));
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response stream available.");
      }

      let done = false;
      let accumulatedContent = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          accumulatedContent += chunk;
          
          setMessagesByPersona((prev) => ({
            ...prev,
            [persona]: prev[persona].map((m) =>
              m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m
            ),
          }));
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessagesByPersona((prev) => ({
        ...prev,
        [persona]: prev[persona].map((m) =>
          m.id === assistantMsgId ? { ...m, content: `⚠️ ${msg}` } : m
        ),
      }));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messagesByPersona]);

  // ── Input send triggers ────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    sendMessage(input, selectedPersona);
  }, [input, selectedPersona, sendMessage]);

  const handleExampleClick = useCallback((prompt: string) => {
    sendMessage(prompt, selectedPersona);
  }, [selectedPersona, sendMessage]);

  return (
    <MainLayout
      selectedPersona={selectedPersona}
      onPersonaChange={handlePersonaChange}
    >
      <div className="chat-area">
        <ChatWindow
          messages={messages}
          persona={currentPersonaInfo}
          isLoading={isLoading}
          onExampleClick={handleExampleClick}
        />
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  );
}

