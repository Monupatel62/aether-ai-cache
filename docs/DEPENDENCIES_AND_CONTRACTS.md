# Dependencies and Contracts — aether-ai-cache

**Status:** Proposed; cache backend not selected.

## Implementation dependencies

- Selected cache backend/adapter (TBD).
- Shared key, value, TTL and invalidation contracts.
- Optional low-level telemetry interface, if approved.

## Consumers versus dependencies

API, Gateway and Search may be consumers of a cache contract if caching is justified for their use cases. They are not implementation dependencies of the Cache repository. Database is not a mandatory dependency unless a specific cache metadata or coordination requirement is approved and documented.

## Owned capabilities

Cache key isolation, stale-data rules, invalidation strategy, stampede control, and cache-outage behavior. Cache MUST NOT own authoritative permissions, billing, or durable run state.

## Contract requirements

- Version public schemas and message envelopes.
- Document limits, timeouts, retry behavior, idempotency, cancellation, and error handling where relevant.
- Preserve correlation IDs across API, agent, tool, queue, and provider operations.
- Document operational signals and failure recovery, not only the happy path.
- Version keys and value formats; document TTL and invalidation semantics.
- Keep cache payloads minimal and reconstructible.
- Never use cached permissions as authority or bypass execution-time authorization.
- Specify timeout, retry, stampede and cache-outage behavior.
- Review tenant isolation and data retention implications for every cached value.
