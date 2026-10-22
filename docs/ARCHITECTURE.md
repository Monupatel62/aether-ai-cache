# Architecture — aether-ai-cache

**Status:** Proposed; not implemented.

## Mission
Cache interfaces, key conventions, TTL, invalidation, and tenant-aware cache helpers.

## Ownership
Cache key isolation, stale-data rules, invalidation strategy, stampede control, no authoritative permissions/billing/run state in cache.

## Dependencies
API, gateway, search, database.

## Trust boundaries
- Cache entries are never authoritative permissions, billing, audit history, approvals or durable run state.
- Cache keys must include tenant/resource scope where applicable.
- Reauthorize protected reads at the resource boundary when policy requires freshness.
- Define TTL, invalidation, stampede control and outage behavior before implementation.

## Failure behavior
A cache miss/outage must not grant access. Define bounded fallback behavior and avoid broad stale-data fallback for protected content.
