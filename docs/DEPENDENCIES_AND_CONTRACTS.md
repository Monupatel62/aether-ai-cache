# Dependencies and Contracts — aether-ai-cache

**Status:** Proposed; cache backend not selected.

## Dependency direction

Cache depends only on a selected cache adapter (TBD) and narrow shared key/value, TTL, and telemetry contracts where required. API, Gateway, Search, and other domain components are consumers of the Cache contract; Cache must not import those consumers or depend on their implementations. Cache is an optimization boundary, not a source of truth.

## Owned capabilities

Cache key isolation, stale-data rules, invalidation strategy, stampede control, and cache outage behavior. Authoritative permissions, billing state, and durable run state must not be owned by or trusted from cache.

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
- Do not introduce a mandatory cache backend until an architecture decision approves it.
