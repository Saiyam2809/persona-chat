/**
 * scripts/search.ts
 *
 * CLI test harness for lib/rag.ts.
 * Use this to verify retrieval quality after seeding Pinecone.
 *
 * Usage:
 *   npm run kb:search "How should I learn React?" hitesh
 *   npm run kb:search "design a URL shortener" piyush
 */

import "./load-env";

// Re-export from lib/rag.ts so existing imports from scripts/search still work
export { searchKnowledgeBase, formatContext, type SearchResult } from "@/lib/rag";

// ─── CLI ─────────────────────────────────────────────────────────────────────

const isMain =
  process.argv[1]?.endsWith("search.ts") || process.argv[1]?.endsWith("search.js");

if (isMain) {
  const [, , query, persona = "hitesh"] = process.argv;

  if (!query) {
    console.error(
      '\nUsage: npm run kb:search "<query>" [hitesh|piyush]\n' +
      'Example: npm run kb:search "How do I learn React?" hitesh\n'
    );
    process.exit(1);
  }

  (async () => {
    const { searchKnowledgeBase, formatContext } = await import("@/lib/rag");

    console.log(`\nSearching for: "${query}"`);
    console.log(`Persona:       ${persona}`);
    console.log(`Index:         ${process.env.PINECONE_INDEX ?? "persona-chat"}\n`);

    const results = await searchKnowledgeBase(query, persona, 5);

    if (results.length === 0) {
      console.log("No results found above the score threshold (0.30).");
      console.log("Make sure you have run: npm run kb:seed");
      return;
    }

    console.log(`Found ${results.length} relevant chunks:\n`);

    results.forEach((r, i) => {
      const bar = "█".repeat(Math.round(r.score * 20));
      console.log(`─── Result ${i + 1} ───────────────────────────────────`);
      console.log(`Score:   ${(r.score * 100).toFixed(1)}%  ${bar}`);
      console.log(`File:    ${r.metadata.file}`);
      console.log(`Title:   ${r.metadata.title}`);
      console.log(`Source:  ${r.metadata.source}`);
      if (r.metadata.tags) console.log(`Tags:    ${r.metadata.tags}`);
      console.log(`Content: ${r.content.slice(0, 350).replace(/\n/g, " ")}…`);
      console.log();
    });

    console.log("─── Formatted context (injected into system prompt) ───");
    console.log(formatContext(results).slice(0, 800) + "…");
  })().catch((err) => {
    console.error("Search failed:", err.message);
    process.exit(1);
  });
}
