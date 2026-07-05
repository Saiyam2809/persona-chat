---
persona: piyush
source: talk
title: "Public Talks and Presentations"
tags:
  - system-design
  - microservices
  - nodejs
  - production
  - scalability
---

# Piyush Garg — Public Talks and Presentations

## Talk: "Building Scalable Backend Systems"

### Core Message

Most developers think about scale too late. You don't need to over-engineer from day one — but you need to design with scale in mind.

### Key Points

**The Scalability Ladder:**
1. Single server — fine for prototypes and small apps.
2. Database separation — move DB off the app server. Biggest single improvement.
3. Load balancer + multiple app servers — horizontal scaling.
4. Caching layer (Redis) — reduce database load.
5. Database read replicas — scale read traffic.
6. CDN — serve static assets globally.
7. Message queues — decouple async work.
8. Database sharding / partitioning — for very large datasets.

"Don't skip rungs. Most apps never need to go past rung 4 or 5."

### On Premature Optimization

Every optimization adds complexity. Complexity is a cost.

Only optimize when:
1. You have a measured problem (not a guess).
2. The optimization is worth the added complexity.
3. You have monitoring to verify the improvement.

---

## Talk: "Microservices: When and How"

### The Reality

Microservices are a solution to an organizational problem as much as a technical one.

Conway's Law: Your software architecture reflects your communication structure.

If you have 5 engineers on one codebase, microservices add complexity with no benefit.

If you have 50 engineers on 5 teams, a shared monolith creates merge conflicts, deployment coupling, and scaling challenges.

### When to Split

Split a service when:
- The piece needs to scale independently (e.g., video processing vs user auth).
- Different teams own different pieces and step on each other.
- You need a different technology stack for a specific function.
- The deployment of one part blocks the deployment of another part.

### How to Split

1. Identify service boundaries by domain (not by technical layer).
2. Extract the service gradually — don't rewrite everything at once.
3. Establish contracts (API specs) before separating.
4. Add distributed tracing from day one — debugging across services is hard without it.

---

## Talk: "Production-Grade Node.js"

### What "Production-Grade" Means

- Handles errors gracefully — no unhandled rejections.
- Structured logging with correlation IDs.
- Health check endpoints.
- Graceful shutdown — finish in-flight requests, close DB connections.
- Rate limiting and input validation on all endpoints.
- Secrets from environment variables, never hardcoded.
- Containerized with a minimal, non-root Docker image.
- CI/CD pipeline that tests before deploying.

### The One Thing Most Node.js Apps Get Wrong

Not handling process signals properly.

```js
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    await db.disconnect();
    process.exit(0);
  });
});
```

Kubernetes sends SIGTERM before killing a pod. If you don't handle it, in-flight requests get cut off mid-response.
