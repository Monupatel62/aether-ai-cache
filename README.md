# aether-ai-cache

**Status:** Transport-neutral cache adapter wrapper implemented on a feature branch. No cache backend is selected or deployed.

## Implemented

- [Cache source](src/index.js): tenant-prefixed keys, bounded TTLs and value sizes, JSON serialization, corruption cleanup, and backend error normalization.
- Cache writes require `reconstructible: true` to discourage using cache as an authoritative source for permissions, runs, billing, or audit records.
- [Unit tests](test/cache.test.js): tenant separation, TTL bounds, invalid keys, corrupt entries, value limits, and backend failures.
- Dependency-free Node.js package with Node 20/22 CI.

## Limitations

No Redis-compatible backend, distributed invalidation, atomic counters, stampede protection, metrics, or deployment is included. Callers must not place tokens, credentials, prompts, or authoritative security state in cache without a reviewed policy.

## Documentation

- [Repository specification](docs/REPOSITORY_SPECIFICATION.md)
- [Project specification](docs/PROJECT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Dependencies and contracts](docs/DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Security review](docs/SECURITY_REVIEW.md)
- [Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
