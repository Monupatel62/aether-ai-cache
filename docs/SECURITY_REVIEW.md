# Security Review — aether-ai-cache

**Status:** Design checklist; no audit/certification claimed.

## Main risks
Cross-tenant cache collisions, stale permission/data after revocation, sensitive data retention, cache poisoning, stampede/resource exhaustion, and secret leakage in telemetry.

## Required controls
Cache keys must include the correct tenant/resource scope. Never treat cache contents as authoritative permissions, billing, or durable run state. Define TTL/invalidation, prevent cross-tenant cache hits, and avoid caching sensitive responses unless policy permits it.
- Include tenant/resource identity in keys where applicable.
- Do not cache authorization as a durable grant.
- Define invalidation/revocation behavior and fail-safe outage semantics.
- Bound payloads and TTL; redact protected values from logs.

## Verification
Test tenant key isolation, stale permission invalidation, TTL expiration, cache stampede behavior, malformed values, and that cache outages fail safely without granting access.

Before release, add unit tests, contract tests for direct dependencies, negative authorization/input tests, and failure/recovery tests for the behavior this component owns. Use synthetic or sanitized data only.
- [ ] Cross-tenant isolation tests.
- [ ] Revocation and stale-value tests.
- [ ] Cache outage behavior tested.
- [ ] Secret/dependency scans recorded.
