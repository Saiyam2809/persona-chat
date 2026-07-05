import "./load-env";

import fs from "fs";
import path from "path";
import { glob } from "glob";
import matter from "gray-matter";
import { index } from "@/lib/pinecone";
import { getEmbeddings } from "@/lib/embeddings";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Chunk {
  id: string;
  text: string;
  metadata: {
    persona: string;
    source: string;
    title: string;
    url: string;
    tags: string;
    chunkIndex: number;
    documentId: string;
    content: string; // compatibility with current RAG search
    text: string;    // compatibility with Step 7 requirements
  };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CHUNK_SIZE = 450;      // 400–500 words
const OVERLAP = 75;         // 50–100 words
const BATCH_SIZE = 50;      // batch size for safe API requests

// ─── Word-based overlap chunker ──────────────────────────────────────────────

function splitText(text: string): string[] {
  // Preserve code blocks as atomic units
  const CODE_BLOCK_RE = /```[\s\S]*?```/g;
  const codeBlocks: string[] = [];
  const withPlaceholders = text.replace(CODE_BLOCK_RE, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  const paragraphs = withPlaceholders.split(/\n\n+/).filter((p) => p.trim());
  const chunks: string[] = [];
  let currentWords: string[] = [];

  const flush = () => {
    if (currentWords.length > 0) {
      chunks.push(currentWords.join(" "));
    }
  };

  for (const para of paragraphs) {
    const words = para.split(/\s+/);

    if (currentWords.length + words.length > CHUNK_SIZE && currentWords.length > 0) {
      flush();
      currentWords = currentWords.slice(-OVERLAP);
    }

    currentWords.push(...words);
  }

  flush();

  // Restore code block placeholders
  return chunks.map((chunk) =>
    chunk.replace(/__CODE_BLOCK_(\d+)__/g, (_, i) => codeBlocks[parseInt(i)])
  );
}

// ─── Ingestion Pipeline ───────────────────────────────────────────────────────

async function runIngestion() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log("────────────────────────────────────────────────");
  console.log("  Persona Chat — Ingestion Pipeline");
  console.log(`  Mode: ${isDryRun ? "DRY RUN" : "LIVE"}`);
  console.log("────────────────────────────────────────────────\n");

  const dataRoot = path.join(process.cwd(), "data");
  const pattern = path.join(dataRoot, "**", "*.md").replace(/\\/g, "/");
  const files = await glob(pattern);

  console.log(`Found ${files.length} markdown documents under data/\n`);
  const allChunks: Chunk[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf-8");
    const { data: fm, content: body } = matter(raw);

    const relPath = path.relative(dataRoot, file).replace(/\\/g, "/");
    const documentId = relPath;

    const rawChunks = splitText(body);
    console.log(`  Parsing: ${relPath} (${rawChunks.length} chunks)`);

    rawChunks.forEach((text, chunkIndex) => {
      // Keep title prepended to each chunk to preserve contextual reference
      const chunkText = fm.title ? `# ${fm.title}\n\n${text}` : text;

      allChunks.push({
        id: `${relPath}-chunk-${chunkIndex}`,
        text: chunkText,
        metadata: {
          persona: fm.persona ?? "unknown",
          source: fm.source ?? "unknown",
          title: fm.title ?? "",
          url: fm.url ?? "",
          tags: Array.isArray(fm.tags) ? fm.tags.join(",") : "",
          chunkIndex,
          documentId,
          content: chunkText.slice(0, 500), // for RAG search retrieval content mapping
          text: chunkText.slice(0, 500),    // for Step 7 requirements
        },
      });
    });
  }

  console.log(`\nTotal generated chunks: ${allChunks.length}`);

  if (isDryRun) {
    console.log("\n✓ Dry run complete. No embeddings generated, no Pinecone updates.");
    return;
  }

  console.log("\nGenerating embeddings and uploading to Pinecone...");

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const batchNum = i / BATCH_SIZE + 1;
    const totalBatches = Math.ceil(allChunks.length / BATCH_SIZE);

    console.log(`  Processing batch ${batchNum}/${totalBatches} (${batch.length} chunks)...`);

    try {
      // Step 6: Generate Embeddings
      const embeddings = await getEmbeddings(batch.map((c) => c.text));

      // Step 7: Format Pinecone vectors
      const vectors = batch.map((chunk, idx) => ({
        id: chunk.id,
        values: embeddings[idx],
        metadata: chunk.metadata,
      }));

      // Step 7: Upload to Pinecone
      await index.upsert({ records: vectors });
    } catch (err) {
      console.error(`  ✗ Batch ${batchNum} failed:`, (err as Error).message);
      throw err;
    }
  }

  console.log("\n✓ Ingestion pipeline completed successfully!");
}

runIngestion().catch((err) => {
  console.error("\n✗ Ingestion failed:", err.message);
  process.exit(1);
});
