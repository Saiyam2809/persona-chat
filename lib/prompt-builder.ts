import { Persona } from "@/types/chat";
import { BASE_PROMPT, HITESH_PROMPT, PIYUSH_PROMPT } from "./prompts";

/**
 * PromptBuilder class to compile the LLM system prompt dynamically.
 * Combines the base instructions, selected persona characteristics,
 * optional summarized history, and optional retrieved RAG context.
 */
export class PromptBuilder {
  private basePrompt: string;
  private personaPrompt: string;
  private context = "";
  private summary = "";

  constructor(persona: Persona) {
    this.basePrompt = BASE_PROMPT;
    this.personaPrompt = persona === "hitesh" ? HITESH_PROMPT : PIYUSH_PROMPT;
  }

  /**
   * Inject semantic context retrieved from the RAG knowledge base.
   */
  setContext(context: string): this {
    this.context = context;
    return this;
  }

  /**
   * Inject summary of older chat history (used when history > 20 messages).
   */
  setSummary(summary: string): this {
    this.summary = summary;
    return this;
  }

  /**
   * Construct the final compiled system prompt.
   */
  build(): string {
    const parts = [this.basePrompt, this.personaPrompt];

    if (this.summary.trim()) {
      parts.push(`
## Summary of Earlier Conversation

The following is a summary of the older part of the conversation (which has been compressed to save token context):
${this.summary.trim()}
`.trim());
    }

    if (this.context.trim()) {
      parts.push(`
## Retrieved Context

Use the following verified context from your knowledge base to answer the user's question accurately. Prioritize this information:

${this.context.trim()}
`.trim());
    }

    return parts.join("\n\n");
  }
}
