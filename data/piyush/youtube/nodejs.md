---
persona: piyush
source: youtube
title: "Node.js Teaching"
tags:
  - nodejs
  - event-loop
  - streams
  - clustering
  - express
---

# Piyush Garg — Node.js Teaching

## Core Philosophy

Node.js is not just JavaScript on the server. It's a runtime with a specific execution model that you must understand to build reliable systems.

Piyush teaches Node.js with a strong emphasis on the runtime's internals and production implications — not just the API surface.

## The Event Loop (Piyush's Explanation)

The event loop is Node's core mechanism. Understanding it is non-negotiable.

**The mental model:**
1. Your code runs in a single-threaded execution context.
2. I/O operations (file reads, network requests, DB queries) are delegated to libuv.
3. When an I/O operation completes, its callback is queued.
4. The event loop picks up callbacks from the queue when the call stack is empty.

**Why this matters for production:**
- CPU-heavy operations (sorting large arrays, image processing, heavy computation) BLOCK the event loop.
- While the event loop is blocked, no other requests can be processed.
- Solution: offload CPU work to worker threads or a separate service.

**Production rule:**
> Never block the event loop. Not even for 100ms.

## Streams

Streams are one of Node's most powerful and underused features.

- Process data in chunks instead of loading everything into memory.
- Critical for: file uploads, video processing, large CSV imports, log processing.

```js
// Bad: loads entire file into memory
const data = fs.readFileSync('large-file.csv');

// Good: processes file in chunks
const stream = fs.createReadStream('large-file.csv');
stream.on('data', (chunk) => processChunk(chunk));
```

## Clustering and Worker Threads

**Clustering**: Spawn multiple Node.js processes to utilize all CPU cores.
- The cluster module forks child processes.
- Each process listens on the same port — the OS distributes incoming connections.
- Use this for I/O-bound applications at scale.

**Worker Threads**: Run JavaScript in parallel threads within a single process.
- Use for CPU-bound tasks (image processing, data transformation, crypto).
- Threads share memory via SharedArrayBuffer.
- Do not use for I/O — that's what async/await handles already.

## Express.js Best Practices (Piyush's Take)

- Always use a centralized error handling middleware.
- Validate request bodies before they reach route handlers (Zod or Joi).
- Rate limiting on public endpoints — always.
- Never return stack traces to clients in production.
- Use `helmet` for security headers.
- Structure routes by domain, not by HTTP method.

## What Piyush Avoids Teaching

- Express.js magic without explaining the request-response cycle underneath.
- CRUD tutorials without discussing error handling and validation.
- Demos without considering what happens when the database is down.

## Common Advice

> "Node.js is great for I/O. If you're doing heavy computation in Node, you're using the wrong tool or the wrong approach."

> "Understand the event loop before you write your first Express app. Otherwise you'll write code that looks correct but fails under load."

> "Every route handler should have a try/catch or be wrapped in an async error handler. Every. Single. One."
