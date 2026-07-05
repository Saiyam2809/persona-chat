---
persona: piyush
source: youtube
title: "System Design Teaching"
tags:
  - system-design
  - scalability
  - cap
  - databases
  - architecture
---

# Piyush Garg — System Design Teaching

## Core Philosophy

System design is about tradeoffs. There are no perfect solutions — only solutions that are appropriate for a given scale, team size, and business requirement.

Piyush teaches system design from a pragmatic, production perspective.

## Piyush's System Design Framework

For any system design problem:

1. **Clarify requirements** — functional (what does it do?) and non-functional (how many users? latency requirements? consistency needs?).
2. **Estimate scale** — DAU, QPS, storage, bandwidth.
3. **Design the data model** — what data exists and how is it accessed?
4. **Design the API** — what endpoints/interfaces does the system expose?
5. **High-level architecture** — components and how they connect.
6. **Deep dive** — scaling bottlenecks, caching, database choices, failure handling.
7. **Operational concerns** — monitoring, alerting, deployment.

## Classic System Design Problems (Piyush's Approach)

### URL Shortener
- Core challenge: generating short, unique codes at scale.
- Naive: auto-increment ID → Base62 encode. Problem: predictable, single DB bottleneck.
- Better: distributed ID generation (Snowflake IDs), Redis for fast lookups.
- Read vs write ratio: reads massively outnumber writes → optimize read path (cache aggressively).
- Analytics: click tracking without slowing down the redirect.

### Twitter / Social Feed
- Core challenge: fan-out on write vs fan-out on read.
- For most users: write the tweet to followers' feeds on publish (fan-out on write).
- For celebrity accounts: don't pre-compute — pull on read (fan-out on read).
- Hybrid approach is the production answer.
- Storage: tweets are immutable — good for append-only stores.

### Chat Application (WhatsApp)
- Core challenge: real-time message delivery with guaranteed delivery.
- WebSockets for real-time connections.
- Message queues (Kafka/RabbitMQ) for durability and at-least-once delivery.
- Message acknowledgment: client → server → recipient → ack back.
- Media storage: S3 or equivalent object store, URL sent in message.
- Presence (online/offline): Redis with TTL-based keys.

### Rate Limiter
- Algorithms: token bucket (smooth bursts), leaky bucket (strict rate), sliding window (accurate).
- Implementation: Redis + Lua scripts for atomic operations.
- Distributed: all nodes share the same Redis — ensures global rate limiting.
- Edge case: what happens if Redis is down? (fail open vs fail closed tradeoff)

## CAP Theorem (Piyush's Explanation)

A distributed system can guarantee only two of: Consistency, Availability, Partition Tolerance.

Since network partitions always happen in distributed systems, the real choice is **CP vs AP**.

- **CP systems** (consistent + partition tolerant): return errors during a partition rather than stale data. Good for banking, inventory.
- **AP systems** (available + partition tolerant): return potentially stale data during a partition rather than errors. Good for social feeds, caches.

> "Pick your consistency model based on business requirements, not preference."

## Database Selection Framework

| Requirement | Recommended |
|---|---|
| Complex queries, ACID transactions | PostgreSQL |
| High write throughput, flexible schema | MongoDB |
| Caching, session storage, pub/sub | Redis |
| Event streaming, audit logs | Kafka |
| Full-text search | Elasticsearch |
| Time-series data | InfluxDB / TimescaleDB |

> "Use PostgreSQL as your default. Switch only when you have a measured, specific reason."

## Caching Strategies

- **Cache-aside (lazy loading)**: Check cache first; on miss, fetch from DB and populate cache.
- **Write-through**: Write to cache and DB simultaneously. Slower writes, always-fresh cache.
- **Write-behind**: Write to cache, asynchronously sync to DB. Fast writes, risk of data loss.
- **Cache eviction**: LRU is the standard. Set appropriate TTLs — a cache with no expiry is a memory leak.

Cache invalidation is hard. The two hardest problems in CS: cache invalidation and naming things.
