---
persona: piyush
source: youtube
title: "Database Teaching"
tags:
  - databases
  - postgresql
  - redis
  - mongodb
  - kafka
---

# Piyush Garg — Database Teaching

## Core Philosophy

Database choice is the most consequential technical decision in most applications.
Getting it wrong means rewriting your data layer later — which is painful.

> "Choose your database based on your access patterns, not on what's trending."

## PostgreSQL

### Why Piyush Recommends PostgreSQL as Default

- ACID transactions: your data will be consistent even if the server crashes mid-operation.
- Complex queries: JOINs, aggregations, CTEs, window functions.
- Mature ecosystem: battle-tested at massive scale (Instagram, Shopify, GitHub use PostgreSQL).
- Extensions: pgvector for embeddings, PostGIS for geospatial, TimescaleDB for time-series.

### Indexing (Piyush's Deep Dive)

Without indexes, every query is a full table scan — fine for 1,000 rows, catastrophic for 10 million.

Types:
- **B-tree** (default): range queries, equality checks, ordering.
- **Hash**: equality checks only — rarely use over B-tree.
- **GIN**: full-text search, JSONB columns, arrays.
- **GiST**: geometric data, full-text with ranking.
- **BRIN**: very large tables with naturally ordered data (timestamps, sequential IDs).

**Index on what you query by, filter by, or JOIN on.**

Production gotcha: indexes speed up reads but slow down writes (the index must be updated). Don't index every column — measure first.

### Query Optimization

- Use `EXPLAIN ANALYZE` to see what PostgreSQL actually does.
- Seq Scan on a large table = missing index.
- Nested loop vs hash join — the planner chooses based on statistics.
- `VACUUM` and `ANALYZE` — keep statistics fresh.
- Connection pooling (pgBouncer) — PostgreSQL handles ~100 connections well; beyond that, use a pool.

## Redis

### What Redis Is

Redis is an in-memory data structure store. It's fast because:
- All data lives in RAM.
- Single-threaded — no lock contention.
- Optimized data structures (sorted sets, hyperloglogs, streams).

### Use Cases (Piyush's List)

1. **Caching**: Store expensive DB query results with a TTL.
2. **Session storage**: Fast user session lookup.
3. **Rate limiting**: Atomic increment operations.
4. **Pub/Sub**: Real-time messaging between services.
5. **Job queues**: Bull/BullMQ built on Redis lists/sorted sets.
6. **Leaderboards**: Sorted sets with O(log n) rank queries.

### Redis Gotchas

- Redis is not a database. It's a cache. Don't use it as your source of truth unless you're using Redis persistence (AOF/RDB) deliberately.
- Memory is expensive. Set appropriate TTLs. Eviction policies (LRU) need configuration.
- Redis is single-threaded per core. For very high throughput, use Redis Cluster.

## MongoDB

### When Piyush Recommends MongoDB

- Flexible, rapidly-changing schemas.
- Document-oriented data (nested objects that are always accessed together).
- High write throughput requirements.
- When you don't need complex JOIN queries.

### When He Doesn't

- When you need ACID transactions across documents (use PostgreSQL).
- When your data is highly relational.
- When you need complex aggregations (PostgreSQL's query planner is often faster).

## Kafka

### Why Kafka

Kafka is a distributed event streaming platform. It decouples producers from consumers.

Use cases:
- **Event sourcing**: append-only log of everything that happened.
- **Async processing**: user sign-up event → send welcome email, create profile, notify analytics.
- **Stream processing**: real-time analytics, fraud detection.
- **Service decoupling**: services emit events, don't call each other directly.

Key concepts:
- **Topic**: a named stream of records.
- **Partition**: horizontal scaling unit. A topic can have many partitions.
- **Consumer group**: multiple consumers share the work of processing a topic.
- **Offset**: position in the partition. Consumers track where they've read up to.

> "Kafka is overkill for most applications. Use it when you need guaranteed delivery, replay capability, or you're building an event-driven architecture with multiple services."
