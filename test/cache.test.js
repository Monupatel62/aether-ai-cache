import test from "node:test";
import assert from "node:assert/strict";
import { CacheError, createCache } from "../src/index.js";

function fixture(overrides = {}) {
  const values = new Map();
  const adapter = {
    async get(key) { return values.get(key) ?? null; },
    async set(key, value, ttl) { values.set(key, value); },
    async delete(key) { values.delete(key); },
  };
  return { cache: createCache({ adapter, namespace: "aether", ...overrides }), values, adapter };
}

test("sets and reads reconstructible values with tenant-scoped keys", async () => {
  const { cache, values } = fixture();
  await cache.set({ tenantId: "tenant-a", key: "profile:summary", value: { count: 3 }, ttlSeconds: 30, reconstructible: true });
  assert.deepEqual(await cache.get({ tenantId: "tenant-a", key: "profile:summary" }), { count: 3 });
  assert.equal(values.has("aether:tenant-a:profile:summary"), true);
  assert.equal(await cache.get({ tenantId: "tenant-b", key: "profile:summary" }), null);
});

test("rejects non-authoritative flag absence, invalid keys, and TTLs", async () => {
  const { cache } = fixture();
  await assert.rejects(cache.set({ tenantId: "tenant-a", key: "session", value: { token: "secret" }, ttlSeconds: 30 }), (e) => e.code === "non_authoritative_data_only");
  await assert.rejects(cache.set({ tenantId: "tenant-a", key: "x", value: {}, ttlSeconds: 4000, reconstructible: true }), (e) => e.code === "invalid_ttl");
  await assert.rejects(cache.set({ tenantId: "tenant-a", key: "", value: {}, reconstructible: true }), CacheError);
});

test("deletes corrupt cache entries instead of returning them", async () => {
  const { cache, values } = fixture();
  values.set("aether:tenant-a:key", "not-json");
  assert.equal(await cache.get({ tenantId: "tenant-a", key: "key" }), null);
  assert.equal(values.has("aether:tenant-a:key"), false);
});

test("enforces serialized value limits and hides backend errors", async () => {
  const { cache } = fixture({ maxValueBytes: 20 });
  await assert.rejects(cache.set({ tenantId: "tenant-a", key: "key", value: { text: "x".repeat(100) }, reconstructible: true }), (e) => e.code === "value_too_large");
  const broken = fixture({ adapter: { get: async () => { throw new Error("backend private details"); }, set: async () => {}, delete: async () => {} } }).cache;
  await assert.rejects(broken.get({ tenantId: "tenant-a", key: "key" }), (e) => e.code === "backend_unavailable" && !e.message.includes("private"));
});
