/**
 * scripts/chunk.ts
 *
 * Reads all .md files from data/, parses YAML frontmatter,
 * and splits content into overlapping chunks of ~400 words.
 *
 * Run: npx tsx scripts/chunk.ts
 */

import matter from "gray-matter";
import fs from "fs";
import path from "path";
import { glob } from "glob";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChunkMetadata {
  persona: string;
  source: string;
  title: string;
  url: string;
  tags: string[];
  file: string;
  chunkIndex: number;
  totalChunks: number;
}

export interface Chunk {
  id: string;
  content: string;
  metadata: ChunkMetadata;
}

// ─── Chunking logic ───────────────────────────────────────────────────────────

const CHUNK_SIZE_WORDS = 400; // target words per chunk
const OVERLAP_WORDS = 50;     // words carried over from the previous chunk

/**
 * Split a body of text into overlapping chunks.
 * Splits on paragraph boundaries (double newline) to avoid cutting mid-sentence.
 * Code blocks are kept together — they are not split.
 */
export function splitIntoChunks(text: string): string[] {
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

    if (currentWords.length + words.length > CHUNK_SIZE_WORDS && currentWords.length > 0) {
      flush();
      // Overlap: carry the last N words into the next chunk
      currentWords = currentWords.slice(-OVERLAP_WORDS);
    }

    currentWords.push(...words);
  }

  flush();

  // Restore code block placeholders
  return chunks.map((chunk) =>
    chunk.replace(/__CODE_BLOCK_(\d+)__/g, (_, i) => codeBlocks[parseInt(i)])
  );
}

// ─── File-level chunker ───────────────────────────────────────────────────────

export function chunkFile(filePath: string, dataRoot = "data"): Chunk[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data: fm, content: body } = matter(raw);

  const rawChunks = splitIntoChunks(body);
  const relPath = path.relative(dataRoot, filePath).replace(/\\/g, "/");

  return rawChunks.map((chunk, i) => {
    // Prepend the title so each chunk is self-contained
    const content = fm.title
      ? `# ${fm.title}\n\n${chunk}`
      : chunk;

    return {
      id: `${relPath}::chunk-${i}`,
      content,
      metadata: {
        persona: fm.persona ?? "unknown",
        source: fm.source ?? "unknown",
        title: fm.title ?? "",
        url: fm.url ?? "",
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        file: relPath,
        chunkIndex: i,
        totalChunks: rawChunks.length,
      },
    };
  });
}

// ─── Bulk chunker ─────────────────────────────────────────────────────────────

export async function chunkAll(dataDir = "data"): Promise<Chunk[]> {
  const pattern = path.join(dataDir, "**", "*.md").replace(/\\/g, "/");
  const files = await glob(pattern);

  const allChunks: Chunk[] = [];

  for (const file of files) {
    try {
      const chunks = chunkFile(file, dataDir);
      allChunks.push(...chunks);
    } catch (err) {
      console.warn(`⚠ Skipped ${file}: ${(err as Error).message}`);
    }
  }

  return allChunks;
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("chunk.ts") || process.argv[1]?.endsWith("chunk.js")) {
  chunkAll().then((chunks) => {
    console.log(`\n✓ Total chunks: ${chunks.length}\n`);

    // Per-persona breakdown
    const byPersona: Record<string, number> = {};
    for (const c of chunks) {
      byPersona[c.metadata.persona] = (byPersona[c.metadata.persona] ?? 0) + 1;
    }
    console.log("Breakdown by persona:");
    for (const [persona, count] of Object.entries(byPersona)) {
      console.log(`  ${persona}: ${count} chunks`);
    }

    // Preview first 2 chunks
    console.log("\n─── Sample chunks ───");
    chunks.slice(0, 2).forEach((c, i) => {
      console.log(`\nChunk ${i + 1}:`);
      console.log(`  ID:       ${c.id}`);
      console.log(`  Persona:  ${c.metadata.persona}`);
      console.log(`  Title:    ${c.metadata.title}`);
      console.log(`  Words:    ${c.content.split(/\s+/).length}`);
      console.log(`  Preview:  ${c.content.slice(0, 120).replace(/\n/g, " ")}…`);
    });
  });
}
