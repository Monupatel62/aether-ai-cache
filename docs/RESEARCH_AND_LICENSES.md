# Research and Licenses — aether-ai-cache

**Status:** Candidate options only; no vendor selected.

- [Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
- [Data infrastructure evaluation](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/DATA_INFRASTRUCTURE_EVALUATION.md)
- [WoHo AI DevKit](https://github.com/Monupatel62/woho-ai-devkit) remains a separate dependency.

See [Data Infrastructure Evaluation](../DATA_INFRASTRUCTURE_EVALUATION.md). A Valkey-compatible cache is a candidate, not an accepted vendor choice. Review the exact server/managed-service license and compatibility, not only the client library. Cache only reconstructible, short-lived data; specify TTL, eviction, tenant-safe keying, invalidation and outage behavior. Never treat cached values as the authority for billing, authorization, audit history, approvals, or durable agent runs. A cache hit must not bypass fresh resource authorization where policy requires it.

Before adoption, verify exact server/managed-service license and client compatibility, security updates, data flow, operational cost and exit path. Do not infer server licensing from a client package license.
