# Dependencies and Contracts — aether-ai-cache

**Status:** Proposed; cache backend not selected.

## Dependencies
API, gateway, search, database.

## Owned capabilities
Cache key isolation, stale-data rules, invalidation strategy, stampede control, no authoritative permissions/billing/run state in cache.

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
