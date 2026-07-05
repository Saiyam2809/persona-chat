import { Persona } from "@/types/chat";
import { openai } from "./openai";
import { PromptBuilder } from "./prompt-builder";
import { retrieveContext } from "./rag";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Summarize older messages to keep the context window size clean and focused.
 */
async function summarizeMessages(messages: ChatMessage[]): Promise<string> {
  const textToSummarize = messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Summarize the following conversation history concisely in a single short paragraph. Focus on the main topics discussed, technical parameters mentioned, and user needs.",
      },
      {
        role: "user",
        content: textToSummarize,
      },
    ],
    max_tokens: 300,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || "";
}

/**
 * Compiles prompt, handles memory window, and returns a raw OpenAI stream.
 */
export async function getChatResponseStream(
  messages: ChatMessage[],
  persona: Persona
) {
  // Extract latest user message for RAG retrieval
  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // 1. Retrieve RAG context (filtered by persona)
  const context = await retrieveContext(lastUserMessage, persona);

  // 2. Memory Slicing and Summarization
  let activeMessages = messages.filter((m) => m.role !== "system");
  let summary = "";

  if (activeMessages.length > 20) {
    // Keep last 10 messages as active conversation window
    const splitIndex = activeMessages.length - 10;
    const toSummarize = activeMessages.slice(0, splitIndex);
    activeMessages = activeMessages.slice(splitIndex);

    try {
      summary = await summarizeMessages(toSummarize);
      console.log(`[Memory] Summarized ${toSummarize.length} old messages.`);
    } catch (err) {
      console.error("[Memory] Summarization failed, sending full history:", err);
      // Fallback: restore full history
      activeMessages = messages.filter((m) => m.role !== "system");
    }
  }

  // 3. Compile System Prompt via PromptBuilder
  const builder = new PromptBuilder(persona);
  builder.setContext(context);
  if (summary) {
    builder.setSummary(summary);
  }
  const systemPrompt = builder.build();

  // 4. Return OpenAI Stream
  const completionStream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      ...activeMessages,
    ],
    max_tokens: 1024,
    temperature: 0.7,
    stream: true,
  });

  return completionStream;
}

/**
 * Send a conversation history to OpenAI and return the assistant's reply (non-streaming).
 * Maintained for backward compatibility.
 */
export async function getChatResponse(
  messages: ChatMessage[],
  persona: Persona
): Promise<string> {
  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  const context = await retrieveContext(lastUserMessage, persona);

  let activeMessages = messages.filter((m) => m.role !== "system");
  let summary = "";

  if (activeMessages.length > 20) {
    const splitIndex = activeMessages.length - 10;
    const toSummarize = activeMessages.slice(0, splitIndex);
    activeMessages = activeMessages.slice(splitIndex);
    try {
      summary = await summarizeMessages(toSummarize);
    } catch (err) {
      console.error("[Memory] Summarization failed:", err);
      activeMessages = messages.filter((m) => m.role !== "system");
    }
  }

  const builder = new PromptBuilder(persona);
  builder.setContext(context);
  if (summary) {
    builder.setSummary(summary);
  }
  const systemPrompt = builder.build();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      ...activeMessages,
    ],
    max_tokens: 1024,
    temperature: 0.7,
  });

  const reply = completion.choices[0]?.message?.content;

  if (!reply) {
    throw new Error("No response received from OpenAI.");
  }

  return reply;
}
