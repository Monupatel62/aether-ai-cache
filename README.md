# @aether-ai/cache

Tenant-scoped cache key conventions, a minimal cache interface, and a bounded in-memory reference adapter for Aether AI.

## Status

Initial implementation proposal. The cache backend, eviction policy, TTL classes, invalidation transport, and operational SLOs remain open decisions. The in-memory adapter is for tests/local development only; it is not distributed, durable, or production-ready.

## Safety rules

- Cache keys include namespace, tenant, resource type, resource ID, and a version.
- Every write requires a bounded TTL; no immortal entries are allowed by this interface.
- Cache entries are never authorization proof and must not become authoritative permissions, billing, or durable run state.
- Values are JSON-only, size-limited, and copied on read in the in-memory adapter.
- The reference adapter bounds entry count and deterministically evicts the oldest inserted entry.

## Example

```ts
import { buildCacheKey, MemoryCacheStore } from "@aether-ai/cache";

const key = buildCacheKey({
  namespace: "model-catalog",
  tenantId: "synthetic-tenant",
  resourceType: "catalog",
  resourceId: "v1"
});
const cache = new MemoryCacheStore();
await cache.set(key, { items: [] }, { ttlMs: 30_000 });
```

Do not use the in-memory adapter as a substitute for a reviewed production backend or fresh resource authorization.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

CI is configured for Node.js 20 and 22. A production backend, invalidation integration, cache stampede control, telemetry, and dependency/security audits remain future work.
