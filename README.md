# Persona Chat

A RAG-powered chatbot simulating the distinct teaching styles of prominent software engineering educators: **Hitesh Choudhary** (practical, conversational, beginner-friendly mentor) and **Piyush Garg** (precise, backend-focused senior engineer analyzing system tradeoffs).

```
User Question
      │
      ▼
Generate Embedding (text-embedding-3-small)
      │
      ▼
Pinecone Filtered Search (filtered by persona)
      │
      ▼
Top 5 Relevant Chunks
      │
      ▼
Build Prompt (PromptBuilder: Base + Persona + Context + Memory Summary)
      │
      ▼
OpenAI Stream (gpt-4o-mini)
      │
      ▼
Real-time Stream + Sources HTTP Header
```

## Features

1. **Dual Persona Simulation**: Switches dynamically between Hitesh Choudhary and Piyush Garg, using custom system instructions and few-shot examples to dictate tone, structure, and communication preferences.
2. **Retrieval-Augmented Generation (RAG)**: Connects to a Pinecone vector database populated with curated documentation from their websites, YouTube channel focus areas, blogs, and public talks.
3. **Real-time Streaming**: Renders the AI completion character-by-character as it is generated, leveraging browser-native chunk streams.
4. **Source Attribution & Citations**: Dynamically extracts context document reference links (e.g. YouTube channels, blogs) from Pinecone metadata, deduplicates them, and renders clickable badges at the bottom of message bubbles.
5. **Sliding Window Memory**: Sends up to 20 messages of intact history. Beyond that, compresses older turns into a single paragraph summary and appends the active 10 messages window to prevent token overflow.

## Tech Stack

* **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React, Framer Motion
* **Vector DB**: Pinecone client
* **Embeddings & LLM**: OpenAI (`text-embedding-3-small`, `gpt-4o-mini`)
* **Parsers**: gray-matter, glob

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=persona-chat
```

## Setup & Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Ingest Knowledge Base**:
   Create a Pinecone index named `persona-chat` with **1536 dimensions** and **cosine metric**. Then, run the ingestion script:
   ```bash
   npm run kb:ingest
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Verify search quality**:
   ```bash
   npm run kb:search "how to learn react" hitesh
   ```

## Folder Structure

```
├── app/
│   ├── api/chat/route.ts  # Streaming & RAG API
│   ├── globals.css        # Animations & Dark Theme
│   ├── layout.tsx
│   └── page.tsx           # Page Hub & Stream Reader
├── components/            # UI components (Sidebar, ChatWindow, MessageBubble)
├── data/                  # Curated Knowledge Base (.md files by persona)
├── docs/                  # Architecture, prompts, RAG, memory documentation
├── lib/                   # Pinecone & OpenAI clients, PromptBuilder, RAG core
├── scripts/               # chunk, embed, ingest, search scripts
└── types/                 # Typescript interfaces
```
