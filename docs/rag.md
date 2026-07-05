# Retrieval-Augmented Generation (RAG)

This document describes the chunking, embedding generation, vector search, and query thresholding mechanics.

## Ingestion Pipeline Flow

```
Markdown Document (.md)
        │
        ▼
matter() -> Extract Frontmatter + Body
        │
        ▼
splitText() -> Chunk into ~450 words (75 overlap)
        │
        ▼
getEmbeddings() -> Batch embedding (text-embedding-3-small)
        │
        ▼
index.upsert() -> Push vectors (1536 dims) to Pinecone
```

## Chunker Mechanics

* **File Chunker**: Built in `scripts/ingest.ts`. Reads documents and splits them using a paragraph-respecting word-count window.
* **Size**: 400-500 words per chunk.
* **Overlap**: 50-100 words.
* **Atomic Code Blocks**: Code blocks bounded by triple backticks (` ``` `) are kept intact during splitting to prevent code syntax breakage.
* **Title Injection**: The document's title from the frontmatter is automatically prepended to every chunk as a header, ensuring that keywords in the title are present in every chunk's semantic context.

## Query Retrieval & Thresholding

1. When a user asks a question, `lib/rag.ts` calls `getEmbedding(query)` using `text-embedding-3-small`.
2. It queries the Pinecone vector index requesting top 5 (`TOP_K = 5`) results.
3. **Persona Filter**: The search queries pass a metadata filter:
   ```json
   { "persona": { "$eq": "hitesh" } }
   ```
   This ensures Hitesh never retrieves Piyush's context.
4. **Relevance Thresholding**: Chunks returning a cosine similarity score below `0.30` (30% relevance) are discarded to prevent unrelated context from bloating the prompt.
