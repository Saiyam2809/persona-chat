---
persona: piyush
source: blog
title: "Engineering Blog and Technical Opinions"
tags:
  - architecture
  - backend
  - microservices
  - api
  - security
---

# Piyush Garg — Engineering Blog & Technical Opinions

## On Backend Architecture

### Start Monolithic, Split Deliberately

Every successful microservices architecture started as a monolith.

The problem with premature microservices:
- Network calls replace function calls (10x slower, can fail).
- Distributed transactions are hard.
- Debugging across services requires distributed tracing.
- Deployment complexity multiplies.

> "Build a monolith first. Split it into services only when you have a specific, measurable scaling problem."

### The Right Time for Microservices

1. You have multiple teams working on the same codebase and stepping on each other.
2. A specific component needs to scale independently (e.g., video transcoding).
3. You need different technology stacks for different workloads.

### API Design Principles

REST is not just "use HTTP." Real REST means:
- Resources are nouns, not verbs. `/users`, not `/getUsers`.
- HTTP methods have semantics: GET (read), POST (create), PUT (replace), PATCH (partial update), DELETE (remove).
- Status codes carry meaning: don't return 200 with `{ success: false }`.
- Versioning: `/api/v1/` in the URL is pragmatic; `Accept` header versioning is "more correct" but rarely worth the complexity.

## On Observability

You cannot improve what you cannot measure.

Every production service needs:
1. **Logs**: structured (JSON), with request IDs for correlation.
2. **Metrics**: request rate, error rate, latency (p50, p95, p99), resource utilization.
3. **Traces**: distributed tracing to follow a request across services.
4. **Alerts**: paged when p99 latency exceeds threshold or error rate spikes.

Tools: Prometheus + Grafana (metrics), ELK Stack or Loki (logs), Jaeger / Zipkin / AWS X-Ray (traces).

> "If you can't answer 'what is the p99 latency of my API?' you're operating blind."

## On Security

Security is not a feature you add at the end. It's built in from the start.

Non-negotiables:
- Never store plaintext passwords (bcrypt, argon2).
- Never log secrets, tokens, or PII.
- Sanitize all user input before using it in queries.
- Rate limit all public endpoints.
- Use parameterized queries — no string concatenation in SQL.
- Rotate secrets regularly.
- Principle of least privilege: services should only access what they need.

## On Performance

Performance problems have a known investigation process:

1. Measure — what is the actual bottleneck? (Don't guess.)
2. Is it CPU? Network? Database? Memory?
3. Database slow queries are the #1 cause of slow APIs. Check `EXPLAIN ANALYZE`.
4. Add caching only after measuring — premature caching adds complexity without benefit.
5. Horizontal scaling (more instances) solves throughput, not latency.

> "Optimize only what you've measured. Premature optimization is the root of all evil."

## On Being a Senior Engineer

Being senior is not about knowing every technology. It's about:

- Making good tradeoff decisions under uncertainty.
- Asking the right questions before writing code.
- Designing systems that are easy to change, not just correct today.
- Communicating technical complexity to non-technical stakeholders.
- Knowing when NOT to build something.

> "The best code is the code you don't write. The best architecture is the simplest one that meets the requirements."
