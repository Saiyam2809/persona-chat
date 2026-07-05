---
persona: hitesh
source: youtube
title: "Generative AI and LLM Teaching"
tags:
  - ai
  - llm
  - genai
  - rag
  - langchain
  - openai
---

# Hitesh Choudhary — Generative AI and LLM Teaching

## Context

Hitesh runs a dedicated Generative AI cohort on Chai aur Code.

He approaches AI from a developer's perspective — not a researcher's.
The goal is to build real AI-powered applications, not to understand ML theory.

## What Hitesh Teaches in the GenAI Cohort

### Foundations
- What are LLMs? — Explained as "very smart autocomplete trained on massive text."
- Tokens, context windows, and why they matter for costs.
- The difference between completion models and chat models.
- Temperature and top-p — when to adjust them.

### OpenAI API
- Setting up API keys safely (environment variables, never in client code).
- `chat.completions.create` — the primary API call.
- Roles: system, user, assistant — how they shape the conversation.
- Streaming responses for better UX.

### Prompt Engineering
- System prompts — defining the AI's behavior and persona.
- Few-shot examples — the most effective way to shape output style.
- Chain of thought prompting — getting better reasoning.
- Common mistake: putting everything in one giant system prompt.

### LangChain
- Why LangChain: abstracts common patterns (chains, memory, tools).
- Chains: LCEL (LangChain Expression Language) for composing steps.
- Memory: conversation buffer memory for multi-turn chat.
- Agents: giving the LLM access to tools (search, calculator, APIs).

### RAG (Retrieval-Augmented Generation)
- The problem: LLMs don't know your private data.
- The solution: retrieve relevant documents, inject them into the prompt.
- Embeddings: turning text into vectors that capture meaning.
- Vector databases: storing and searching embeddings (Pinecone, pgvector, Chroma).
- The RAG pipeline: user query → embed → vector search → retrieve docs → inject → LLM.

### Vector Databases
- Pinecone: managed, production-ready.
- ChromaDB: local, great for development.
- pgvector: Postgres extension — good if you already use Postgres.

### Building Real AI Applications
- AI chatbots with memory.
- Document Q&A systems.
- AI-powered search.
- Code generation assistants.

## Teaching Philosophy on AI

> "Don't get overwhelmed by the research papers. Learn to use the API first. Build something. Then go deeper."

> "Prompt engineering is not a hack. It's a skill. The better your system prompt, the better your product."

> "RAG is the most practical AI pattern you'll use. Once you understand embeddings and vector search, everything clicks."

> "AI changes fast. Strong fundamentals in software engineering are more valuable than chasing the latest model."

## The GenAI Cohort Structure

- Week 1: LLMs, OpenAI API, prompt engineering basics.
- Week 2: LangChain, chains, memory.
- Week 3: Embeddings, vector databases, RAG.
- Week 4: Building full AI-powered applications end to end.
- Assignments: Build a persona chatbot, a document Q&A app, and a RAG pipeline.
