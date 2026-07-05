"use client";

import React from "react";
import Image from "next/image";
import { Message } from "@/types/chat";
import { PersonaInfo } from "@/types/chat";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: Message;
  persona: PersonaInfo;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export default function MessageBubble({ message, persona }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`message-row ${isAssistant ? "message-row-assistant" : "message-row-user"}`}
    >
      {isAssistant && (
        <div className="message-avatar-wrap">
          <Image
            src={persona.avatar}
            alt={persona.name}
            width={36}
            height={36}
            className="message-avatar"
          />
        </div>
      )}

      <div
        className={`message-bubble ${isAssistant ? "bubble-assistant" : "bubble-user"}`}
      >
        {isAssistant && (
          <span className="message-sender-name">{persona.name}</span>
        )}
        <div className="message-content">
          {isAssistant ? (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="md-p">{children}</p>,
                code: ({ children }) => (
                  <code className="md-code">{children}</code>
                ),
                pre: ({ children }) => (
                  <pre className="md-pre">{children}</pre>
                ),
                ul: ({ children }) => <ul className="md-ul">{children}</ul>,
                ol: ({ children }) => <ol className="md-ol">{children}</ol>,
                li: ({ children }) => <li className="md-li">{children}</li>,
                strong: ({ children }) => (
                  <strong className="md-strong">{children}</strong>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <p>{message.content}</p>
          )}
        </div>
        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="message-sources">
            <div className="sources-title">Sources & Citations:</div>
            <div className="sources-list">
              {Array.from(
                new Map(
                  message.sources
                    .filter((s) => s.title && s.url) // filter out incomplete references
                    .map((s) => [s.url, s])
                ).values()
              ).map((src, idx) => (
                <a
                  key={idx}
                  href={src.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-badge"
                  title={src.title}
                >
                  <span>{src.source === "youtube" ? "📺" : "📄"}</span>
                  <span>{src.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>

      {!isAssistant && (
        <div className="message-avatar-wrap">
          <div className="message-user-avatar">
            <span>U</span>
          </div>
        </div>
      )}
    </div>
  );
}
