import { describe, expect, it } from "vitest";
import { buildCacheKey, MemoryCacheStore } from "../src/index.js";

describe("cache contracts", () => {
  it("namespaces keys by tenant, resource, and version", () => {
    const a = buildCacheKey({ namespace: "model", tenantId: "tenant-a", resourceType: "catalog", resourceId: "1" });
    const b = buildCacheKey({ namespace: "model", tenantId: "tenant-b", resourceType: "catalog", resourceId: "1" });
    expect(a).not.toBe(b);
    expect(a).toContain("tenant-a");
  });

  it("requires explicit scope fields", () => {
    expect(() => buildCacheKey({ namespace: "model", tenantId: " ", resourceType: "catalog", resourceId: "1" })).toThrow();
  });

  it("expires entries using an injected clock", async () => {
    let now = 1_000;
    const store = new MemoryCacheStore({ now: () => now });
    await store.set("tenant-a:resource:1", { value: "synthetic" }, { ttlMs: 100 });
    await expect(store.get("tenant-a:resource:1")).resolves.toEqual({ value: "synthetic" });
    now += 100;
    await expect(store.get("tenant-a:resource:1")).resolves.toBeUndefined();
  });

  it("returns copies so consumers cannot mutate the stored object", async () => {
    const store = new MemoryCacheStore();
    await store.set("tenant-a:resource:1", { nested: { value: "original" } }, { ttlMs: 1000 });
    const result = await store.get<{ nested: { value: string } }>("tenant-a:resource:1");
    if (result) result.nested.value = "mutated";
    await expect(store.get("tenant-a:resource:1")).resolves.toEqual({ nested: { value: "original" } });
  });

  it("enforces entry and value limits", async () => {
    const store = new MemoryCacheStore({ maxEntries: 1, maxValueBytes: 20 });
    await store.set("a", { x: 1 }, { ttlMs: 1000 });
    await store.set("b", { x: 2 }, { ttlMs: 1000 });
    await expect(store.get("a")).resolves.toBeUndefined();
    await expect(store.set("large", "this value is much too large", { ttlMs: 1000 })).rejects.toThrow("byte limit");
  });

  it("invalidates only matching prefixes", async () => {
    const store = new MemoryCacheStore();
    await store.set("tenant-a:item:1", "a", { ttlMs: 1000 });
    await store.set("tenant-b:item:1", "b", { ttlMs: 1000 });
    await expect(store.deleteByPrefix("tenant-a:item")).resolves.toBe(1);
    await expect(store.get("tenant-b:item:1")).resolves.toBe("b");
  });
});
