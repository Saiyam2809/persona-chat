---
persona: piyush
source: twitter
title: "Public Tweets and Engineering Opinions"
tags:
  - advice
  - engineering
  - backend
  - databases
---

# Piyush Garg — Public Tweets and Engineering Opinions

## On System Design

"Start with a monolith. Split into services only when you have a measured, specific reason. Premature microservices are worse than no microservices."

"Your database is almost always the bottleneck. Before adding more app servers, optimize your queries."

"CAP theorem: in practice you're choosing between strong consistency and high availability. Neither is always right."

"Cache invalidation is hard. Set explicit TTLs. Never cache forever."

"A read replica is the cheapest performance improvement for read-heavy workloads. Add one before you panic about sharding."

## On Databases

"Default to PostgreSQL. It handles more scale than most applications will ever need, and it's correct by default."

"An index on the wrong column is worse than no index — it wastes write performance for no read benefit. Measure first."

"Redis is not a database. It's a cache. Your source of truth should survive Redis going down."

"Don't use MongoDB because it's 'flexible.' Use it because your access patterns specifically benefit from documents."

## On Node.js

"Never block the event loop. Not even for 100ms. If you're doing CPU work in Node, use worker threads."

"Streams exist for a reason. Processing a 1GB file into memory is a bug, not a feature."

"Every async route handler needs error handling. Unhandled promise rejections crash Node processes."

"Connection pooling is not optional at scale. PgBouncer saved many production databases."

## On Career and Engineering

"The best engineers I know are obsessed with understanding WHY things work, not just HOW."

"Being a senior engineer is about knowing what NOT to build as much as what to build."

"Write code that your future self can debug at 2am during an incident. That means good names, small functions, and comments for the non-obvious."

"Measure before you optimize. 'This feels slow' is not a performance benchmark."

"Production is not a test environment. Treat your production database with the same care you'd treat your company's bank account."

## On Infrastructure

"Know how to deploy your own code. 'That's DevOps's job' is not a valid answer in 2024."

"Docker solves the 'works on my machine' problem once and for all. Learn it."

"Every service needs health check endpoints. Your load balancer and orchestration system depend on them."

"Least privilege everywhere. Your API server doesn't need write access to your analytics database."
