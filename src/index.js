const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,255}$/;
export class CacheError extends Error {
  constructor(code, message = "Cache operation failed") { super(message); this.name = "CacheError"; this.code = code; }
}
function valid(value) { return typeof value === "string" && IDENTIFIER.test(value) && value.trim() === value; }
function isRecord(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }

export function createCache({ adapter, namespace, defaultTtlSeconds = 60, maxTtlSeconds = 3600, maxValueBytes = 1_048_576 }) {
  if (!adapter || typeof adapter.get !== "function" || typeof adapter.set !== "function" || typeof adapter.delete !== "function") throw new TypeError("Cache adapter is incomplete");
  if (!valid(namespace)) throw new TypeError("A valid cache namespace is required");
  if (!Number.isSafeInteger(defaultTtlSeconds) || !Number.isSafeInteger(maxTtlSeconds) || defaultTtlSeconds < 1 || maxTtlSeconds < defaultTtlSeconds || maxTtlSeconds > 86_400) throw new TypeError("Cache TTL configuration is invalid");
  if (!Number.isSafeInteger(maxValueBytes) || maxValueBytes < 1 || maxValueBytes > 10_485_760) throw new TypeError("maxValueBytes is invalid");

  function storageKey(tenantId, key) {
    if (!valid(tenantId) || !valid(key)) throw new CacheError("invalid_key");
    return `${encodeURIComponent(namespace)}:${encodeURIComponent(tenantId)}:${encodeURIComponent(key)}`;
  }

  return Object.freeze({
    async get({ tenantId, key } = {}) {
      const fullKey = storageKey(tenantId, key);
      let raw;
      try { raw = await adapter.get(fullKey); } catch { throw new CacheError("backend_unavailable"); }
      if (raw === null || raw === undefined) return null;
      if (typeof raw !== "string" || new TextEncoder().encode(raw).byteLength > maxValueBytes) {
        try { await adapter.delete(fullKey); } catch { /* best effort corrupt-entry cleanup */ }
        return null;
      }
      try { return JSON.parse(raw); }
      catch {
        try { await adapter.delete(fullKey); } catch { /* best effort corrupt-entry cleanup */ }
        return null;
      }
    },

    async set({ tenantId, key, value, ttlSeconds = defaultTtlSeconds, reconstructible } = {}) {
      if (reconstructible !== true) throw new CacheError("non_authoritative_data_only", "Only explicitly reconstructible data may be cached");
      const fullKey = storageKey(tenantId, key);
      if (!Number.isSafeInteger(ttlSeconds) || ttlSeconds < 1 || ttlSeconds > maxTtlSeconds) throw new CacheError("invalid_ttl");
      if (value === undefined) throw new CacheError("invalid_value");
      let raw;
      try { raw = JSON.stringify(value); } catch { throw new CacheError("invalid_value"); }
      if (typeof raw !== "string" || new TextEncoder().encode(raw).byteLength > maxValueBytes) throw new CacheError("value_too_large");
      try { await adapter.set(fullKey, raw, ttlSeconds); } catch { throw new CacheError("backend_unavailable"); }
      return true;
    },

    async delete({ tenantId, key } = {}) {
      const fullKey = storageKey(tenantId, key);
      try { await adapter.delete(fullKey); } catch { throw new CacheError("backend_unavailable"); }
      return true;
    },
  });
}
