/**
 * scripts/embed.ts
 *
 * Takes an array of Chunks and returns them with OpenAI embeddings attached.
 * Uses text-embedding-3-small (1536 dimensions, fast and cost-effective).
 *
 * Run: npx tsx scripts/embed.ts   (preview — embeds first 3 chunks)
 */

import OpenAI from "openai";
import type { Chunk } from "./chunk";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmbeddedChunk extends Chunk {
  embedding: number[];
}

// ─── OpenAI client ────────────────────────────────────────────────────────────

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in your environment.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── Embed ────────────────────────────────────────────────────────────────────

const EMBEDDING_MODEL = "text-embedding-3-small"; // 1536 dims
const BATCH_SIZE = 100; // OpenAI allows up to 2048 inputs per request

/**
 * Embed an array of chunks in batches.
 * Logs progress to stdout.
 */
export async function embedChunks(chunks: Chunk[]): Promise<EmbeddedChunk[]> {
  const openai = getClient();
  const results: EmbeddedChunk[] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    // Collapse newlines — embeddings don't benefit from whitespace formatting
    const inputs = batch.map((c) => c.content.replace(/\n+/g, " ").trim());

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: inputs,
    });

    for (let j = 0; j < batch.length; j++) {
      results.push({
        ...batch[j],
        embedding: response.data[j].embedding,
      });
    }

    const done = Math.min(i + BATCH_SIZE, chunks.length);
    console.log(`  Embedded ${done} / ${chunks.length} chunks`);
  }

  return results;
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("embed.ts") || process.argv[1]?.endsWith("embed.js")) {
  (async () => {
    // Load dotenv for CLI use
    const { config } = await import("dotenv");
    config({ path: ".env.local" });

    const { chunkAll } = await import("./chunk");

    console.log("Chunking…");
    const chunks = await chunkAll();
    console.log(`✓ ${chunks.length} chunks found\n`);

    // Preview: embed just the first 3 chunks to verify the setup
    const preview = chunks.slice(0, 3);
    console.log(`Embedding first ${preview.length} chunks as a preview…`);
    const embedded = await embedChunks(preview);

    console.log("\n─── Embedding preview ───");
    embedded.forEach((e, i) => {
      console.log(`\nChunk ${i + 1}: ${e.id}`);
      console.log(`  Dimensions: ${e.embedding.length}`);
      console.log(
        `  First 5 values: [${e.embedding.slice(0, 5).map((v) => v.toFixed(6)).join(", ")}]`
      );
    });

    console.log(
      "\n✓ Embeddings look good. Run seed.ts to embed all chunks and upsert to Pinecone."
    );
  })().catch(console.error);
}
