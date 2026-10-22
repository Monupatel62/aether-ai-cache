# Technical Design — aether-ai-cache

**Status:** Proposed, not implementation evidence.

## Purpose
Cache interfaces, key conventions, TTL, invalidation, and tenant-aware cache helpers.

## Responsibilities
Cache key isolation, stale-data rules, invalidation strategy, stampede control, no authoritative permissions/billing/run state in cache.

## Connections
API, gateway, search, database.

## Cache access flow
1. Resolve authenticated principal and required tenant/resource scope.
2. Construct a namespaced key including all relevant tenant/resource dimensions.
3. Check TTL and value version; never treat a hit as authorization proof.
4. Apply fresh resource authorization when required before returning protected content.
5. Handle miss/outage with bounded fallback; record sanitized latency/hit/miss metrics.
6. Invalidate or version entries on relevant source changes.

## Security
Cache keys must include the correct tenant/resource scope. Never treat cache contents as authoritative permissions, billing, or durable run state. Define TTL/invalidation, prevent cross-tenant cache hits, and avoid caching sensitive responses unless policy permits it.

## Open decisions
Backend, eviction policy, TTL classes, invalidation transport, and numeric SLOs require review.
