# Revocation Cache Consistency Requirements

**Status:** Proposed design requirements only. This repository does not yet implement a session revocation store or distributed invalidation protocol.
**Authority boundary:** Cache accelerates reads and distributes invalidation signals; it must not become the canonical identity, session, or tenant-membership authority by implication.

## Responsibilities

- Preserve revocation decisions from the approved authority and never infer “active” from a cache miss.
- Provide bounded-TTL entries, explicit schema/version, safe key namespaces, and documented outage behavior.
- Support idempotent invalidation and stale/out-of-order event protection where the selected backend permits it.
- Avoid raw bearer tokens and secrets in keys, values, logs, metrics, or traces.
- Keep tenant membership/role-grant ownership unresolved pending ADR-0021; do not create a parallel ACL store here.

## Proposed cache record

A record may include a stable session reference or keyed digest, state (`revoked`), event/version marker, effective timestamp, and expiry/retention metadata. The final schema and cryptographic key-management approach require an accepted ADR. Records must not contain raw access or refresh tokens.

## Required behavior

1. A cache miss triggers the approved authoritative lookup; it never means the session is valid.
2. A known revoked session remains revoked when duplicate events arrive.
3. An older event cannot overwrite a newer revocation state or restore a revoked session.
4. Invalidation is scoped to the exact session/principal key and cannot collide across tenants.
5. If the authority/cache is unavailable, the caller applies the approved fail-closed policy; Cache must not silently return “active”.
6. Cache values expire only according to an approved TTL/retention policy. Expiration cannot be interpreted as evidence that revocation was undone.
7. Cache outage, lag, regional partition, and partial invalidation are observable and have recovery/reconciliation procedures.

## Proposed acceptance tests (not executed)

| ID | Scenario | Expected result |
|---|---|---|
| CACHE-REV-001 | Read a session with no cache entry | Authoritative lookup occurs; absence is not treated as active |
| CACHE-REV-002 | Apply the same revoke event twice | Idempotent revoked state |
| CACHE-REV-003 | Apply an older event after a newer revoke | State remains revoked |
| CACHE-REV-004 | Attempt key collision between two sessions or tenants | No cross-key state leakage |
| CACHE-REV-005 | Cache unavailable during revocation check | Caller fails closed under approved policy |
| CACHE-REV-006 | Revoked entry reaches TTL | Authoritative state is consulted before any acceptance decision |
| CACHE-REV-007 | Event delivery is delayed or reordered across regions | Propagation lag is observable; stale state cannot silently grant access beyond approved bound |
| CACHE-REV-008 | Inspect cache and telemetry for bearer credentials | No raw access/refresh token is present |
| CACHE-REV-009 | Revocation event fails schema/authentication checks | Event rejected and observable; existing security state is not weakened |

## Decisions required before implementation

- Selected backend and availability/consistency guarantees.
- Authoritative session-revocation source and durable write semantics.
- Cache TTL, key namespace, digest/key rotation, event schema, ordering/version strategy, replay protection, and retention.
- Failure policy for Gateway and queued-work consumers.
- Approved propagation SLO, including measurement start/end, percentile, and failure-mode behavior. A 500 ms target is not approved by this document.
- Reconciliation process and operational alerts.

See the proposed Auth contract in `aether-ai-auth/docs/SESSION_AND_TOKEN_REVOCATION_CONTRACT.md`. This cross-repository reference describes a proposed contract, not an accepted implementation dependency. ADR-0021 remains open.
