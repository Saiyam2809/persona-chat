/**
 * lib/rag.ts
 *
 * Retrieval-Augmented Generation — the core retrieval engine.
 *
 * Responsibilities:
 *   - searchKnowledgeBase(): embed a query → search Pinecone → return ranked chunks
 *   - formatContext():        format results into a string for the system prompt
 *   - retrieveContext():      the top-level function called by lib/ai.ts at request time
 *
 * Graceful degradation: if PINECONE_API_KEY is not set, returns "" so the app
 * continues to work with only the persona prompt (no crash, no error to the user).
 */

import { index } from "./pinecone";
import { Persona } from "@/types/chat";
import OpenAI from "openai";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: {
    persona: string;
    source: string;
    title: string;
    url: string;
    tags: string;
    file: string;
    chunkIndex: number;
  };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const EMBEDDING_MODEL = "text-embedding-3-small"; // 1536 dims, matches Pinecone index
const TOP_K = 5;
const SCORE_THRESHOLD = 0.3; // discard low-relevance results

// ─── Lazy-initialized client (safe for Next.js API routes) ──────────────────

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  return _openai;
}

// ─── Core search ─────────────────────────────────────────────────────────────

/**
 * 1. Embed the user query using text-embedding-3-small.
 * 2. Query Pinecone with a persona filter to only retrieve that persona's documents.
 * 3. Return results above the score threshold, best match first.
 */
export async function searchKnowledgeBase(
  query: string,
  persona: string,
  topK = TOP_K
): Promise<SearchResult[]> {
  const openai = getOpenAI();

  // Step 1: Embed the query
  const embResponse = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query.replace(/\n/g, " "),
  });
  const queryVector = embResponse.data[0].embedding;

  // Step 2: Semantic search in Pinecone, filtered by persona
  const result = await index.query({
    vector: queryVector,
    topK,
    filter: { persona: { $eq: persona } },
    includeMetadata: true,
  });

  // Step 3: Filter by score threshold and shape the response
  return (result.matches ?? [])
    .filter((m) => (m.score ?? 0) >= SCORE_THRESHOLD)
    .map((m) => ({
      id: m.id,
      score: m.score ?? 0,
      content: (m.metadata?.content as string) ?? "",
      metadata: {
        persona: (m.metadata?.persona as string) ?? "",
        source: (m.metadata?.source as string) ?? "",
        title: (m.metadata?.title as string) ?? "",
        url: (m.metadata?.url as string) ?? "",
        tags: (m.metadata?.tags as string) ?? "",
        file: (m.metadata?.file as string) ?? "",
        chunkIndex: (m.metadata?.chunkIndex as number) ?? 0,
      },
    }));
}

// ─── Context formatter ────────────────────────────────────────────────────────

/**
 * Format ranked search results into a single string for the LLM.
 * Each result is prefixed with its source title and a relevance score.
 */
export function formatContext(results: SearchResult[]): string {
  if (results.length === 0) return "";

  return results
    .map(
      (r, i) =>
        `[Source ${i + 1} — ${r.metadata.title} (${r.metadata.source}), relevance: ${(r.score * 100).toFixed(0)}%]\n${r.content}`
    )
    .join("\n\n---\n\n");
}

// ─── Top-level retrieval function (called by lib/ai.ts) ──────────────────────

/**
 * High-level retrieval:
 *   - Returns "" if Pinecone is not configured (graceful degradation).
 *   - Returns "" if no results exceed the score threshold.
 *   - Never throws — RAG failures are logged and swallowed so chat always works.
 */
export async function retrieveContext(
  query: string,
  persona: Persona
): Promise<string> {
  const apiKey = process.env.PINECONE_API_KEY;

  if (!apiKey || apiKey === "your_pinecone_api_key_here") {
    return ""; // Not configured — persona prompt alone will answer
  }

  try {
    const results = await searchKnowledgeBase(query, persona, TOP_K);

    if (results.length === 0) return "";

    console.log(
      `[RAG] retrieved ${results.length} chunks for "${query.slice(0, 60)}…" (${persona})`
    );

    return formatContext(results);
  } catch (err) {
    // Never let RAG failure break the chat
    console.error("[RAG] retrieval error:", (err as Error).message);
    return "";
  }
}
