/**
 * scripts/seed.ts
 *
 * Full pipeline: chunk → embed → upsert to Pinecone.
 * Run once after adding or updating knowledge base files.
 *
 * Prerequisites:
 *   1. Create a Pinecone index named "persona-chat" (or whatever PINECONE_INDEX is set to)
 *      Dimensions: 1536  |  Metric: cosine
 *   2. Set PINECONE_API_KEY and PINECONE_INDEX in .env.local
 *
 * Run: npx tsx scripts/seed.ts
 * Run (dry run): npx tsx scripts/seed.ts --dry-run
 */
import "./load-env";

import { Pinecone } from "@pinecone-database/pinecone";
import { chunkAll } from "./chunk";
import { embedChunks } from "./embed";

// ─── Config ───────────────────────────────────────────────────────────────────

const PINECONE_INDEX = process.env.PINECONE_INDEX ?? "persona-chat";
const UPSERT_BATCH_SIZE = 100; // Pinecone recommends ≤100 vectors per upsert

// Pinecone metadata string limit is 512 chars — store a preview of the content
const CONTENT_PREVIEW_CHARS = 500;

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed(dryRun = false) {
  console.log("─────────────────────────────────────────────");
  console.log("  Persona Chat — Knowledge Base Seeder");
  console.log(`  Mode: ${dryRun ? "DRY RUN (no Pinecone writes)" : "LIVE"}`);
  console.log("─────────────────────────────────────────────\n");

  // Step 1: Chunk all markdown files
  console.log("Step 1/3 — Chunking data/…");
  const chunks = await chunkAll();
  console.log(`✓ ${chunks.length} chunks from ${new Set(chunks.map((c) => c.metadata.file)).size} files\n`);

  const byPersona: Record<string, number> = {};
  for (const c of chunks) {
    byPersona[c.metadata.persona] = (byPersona[c.metadata.persona] ?? 0) + 1;
  }
  for (const [persona, count] of Object.entries(byPersona)) {
    console.log(`   ${persona}: ${count} chunks`);
  }

  // Step 2: Embed all chunks
  console.log("\nStep 2/3 — Embedding chunks (text-embedding-3-small)…");
  const embedded = await embedChunks(chunks);
  console.log(`✓ ${embedded.length} embeddings generated\n`);

  if (dryRun) {
    console.log("DRY RUN complete. No data written to Pinecone.");
    return;
  }

  // Step 3: Upsert to Pinecone
  console.log("Step 3/3 — Upserting to Pinecone…");

  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is not set. Add it to .env.local.");
  }

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pinecone.Index(PINECONE_INDEX);

  let upserted = 0;

  for (let i = 0; i < embedded.length; i += UPSERT_BATCH_SIZE) {
    const batch = embedded.slice(i, i + UPSERT_BATCH_SIZE);

    const vectors = batch.map((c) => ({
      id: c.id,
      values: c.embedding,
      metadata: {
        persona: c.metadata.persona,
        source: c.metadata.source,
        title: c.metadata.title,
        url: c.metadata.url,
        // Join array as comma-separated — Pinecone metadata values must be string/number/bool
        tags: c.metadata.tags.join(","),
        file: c.metadata.file,
        chunkIndex: c.metadata.chunkIndex,
        totalChunks: c.metadata.totalChunks,
        // Store a content preview for returning to the LLM without a second fetch
        content: c.content.slice(0, CONTENT_PREVIEW_CHARS),
      },
    }));

    await index.upsert({ records: vectors });
    upserted += batch.length;
    console.log(`   Upserted ${upserted} / ${embedded.length}`);
  }

  console.log(`\n✓ Done! ${upserted} vectors in Pinecone index "${PINECONE_INDEX}"`);
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const isDryRun = process.argv.includes("--dry-run");
seed(isDryRun).catch((err) => {
  console.error("\n✗ Seed failed:", err.message);
  process.exit(1);
});
