# Architecture — aether-ai-cache

**Status:** Proposed; not implemented.

## Mission

Cache interfaces, key conventions, TTL, invalidation, and tenant-aware cache helpers.

## Ownership

Cache key isolation, stale-data rules, invalidation strategy, stampede control, and cache-outage behavior. Cache must not own authoritative permissions, billing, audit history, approvals or durable run state.

## Implementation dependencies

- Selected cache backend/adapter (TBD).
- Shared key, value, TTL and invalidation contracts.
- Optional low-level telemetry interface, if approved.

API, Gateway and Search are potential consumers of a stable cache contract; they are not implementation dependencies of Cache. Database is not mandatory unless an explicit metadata or coordination requirement is approved and documented.

## Trust boundaries

- Cache entries are never authoritative permissions, billing, audit history, approvals or durable run state.
- Cache keys must include tenant/resource scope where applicable.
- Reauthorize protected reads at the resource boundary when policy requires freshness.
- Define TTL, invalidation, stampede control and outage behavior before implementation.

## Failure behavior

A cache miss/outage must not grant access. Define bounded fallback behavior and avoid broad stale-data fallback for protected content.
