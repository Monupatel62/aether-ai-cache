import test from "node:test";
import assert from "node:assert/strict";
import { cachePolicy, createCacheKey, validateCacheTtl } from "../src/index.js";

const base = { namespace: "search", tenantId: "tenant-a", resourceType: "collection", resourceId: "collection-1" };

test("creates deterministic tenant-scoped keys", () => {
  assert.equal(createCacheKey(base), createCacheKey({ ...base }));
  assert.ok(createCacheKey(base).startsWith("aether:1.0:search:tenant-a:"));
});

test("prevents cross-tenant key collisions", () => {
  assert.notEqual(createCacheKey(base), createCacheKey({ ...base, tenantId: "tenant-b" }));
});

test("separates resource variants and safely encodes parts", () => {
  assert.notEqual(createCacheKey(base), createCacheKey({ ...base, variant: "v2:partial" }));
  assert.ok(!createCacheKey({ ...base, resourceId: "x:y" }).includes("x:y"));
});

test("rejects missing or malformed key fields", () => {
  assert.throws(() => createCacheKey({ ...base, tenantId: "" }), /tenantId/);
  assert.throws(() => createCacheKey({ ...base, resourceId: "x".repeat(201) }), /resourceId/);
});

test("validates TTL bounds", () => {
  assert.equal(validateCacheTtl(60), 60);
  assert.throws(() => validateCacheTtl(0), /between/);
  assert.throws(() => validateCacheTtl(86401), /between/);
  assert.throws(() => validateCacheTtl(1.5), /between/);
});

test("policy only permits non-sensitive, non-authoritative values", () => {
  assert.deepEqual(cachePolicy({ ttlSeconds: 30 }), {
    contractVersion: "1.0",
    ttlSeconds: 30,
    cacheable: true,
    authorizationRequiredOnRead: true,
    authoritative: false,
  });
  assert.throws(() => cachePolicy({ sensitive: true }), /sensitive/);
  assert.throws(() => cachePolicy({ authoritative: true }), /authoritative/);
});
