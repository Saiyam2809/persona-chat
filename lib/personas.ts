import { Persona } from "@/types/chat";
import { BASE_PROMPT, HITESH_PROMPT, PIYUSH_PROMPT } from "./prompts";

/**
 * Maps each persona ID to its persona-specific prompt.
 * The system prompt sent to OpenAI = BASE_PROMPT + persona prompt + (RAG context if any).
 */
const PERSONA_PROMPTS: Record<Persona, string> = {
  hitesh: HITESH_PROMPT,
  piyush: PIYUSH_PROMPT,
};

/**
 * Build the full system prompt for a given persona.
 * Accepts optional retrieved context from RAG — empty string means no retrieval.
 */
export function buildSystemPrompt(persona: Persona, context = ""): string {
  const personaPrompt = PERSONA_PROMPTS[persona];

  const parts = [BASE_PROMPT, personaPrompt];

  if (context.trim()) {
    parts.push(`
## Retrieved Context

The following information was retrieved from the knowledge base. Use it to answer the user's question accurately:

${context}
`.trim());
  }

  return parts.join("\n\n");
}
