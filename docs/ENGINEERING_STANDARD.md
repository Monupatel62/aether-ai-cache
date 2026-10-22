# Engineering Standard — aether-ai-cache

- Use typed cache interfaces and versioned value formats.
- Namespace keys by tenant/resource and include schema version where useful.
- Define TTL, invalidation, stampede control and bounded retries explicitly.
- Never treat cache values as authoritative permission or durable state.
- Do not log secrets or protected cached values.
- Test tenant isolation, stale data, invalidation and outages.
- Pin dependencies and record licenses/security review.

Cache keys must include the correct tenant/resource scope. Never treat cache contents as authoritative permissions, billing, or durable run state. Define TTL/invalidation, prevent cross-tenant cache hits, and avoid caching sensitive responses unless policy permits it.
