export type CacheJsonPrimitive = string | number | boolean | null;
export type CacheJsonValue = CacheJsonPrimitive | CacheJsonValue[] | { [key: string]: CacheJsonValue };

export interface CacheSetOptions {
  /** Time to live in milliseconds. Required for every write; no immortal cache entries. */
  readonly ttlMs: number;
}

export interface CacheStore {
  get<T extends CacheJsonValue>(key: string): Promise<T | undefined>;
  set<T extends CacheJsonValue>(key: string, value: T, options: CacheSetOptions): Promise<void>;
  delete(key: string): Promise<boolean>;
  deleteByPrefix(prefix: string): Promise<number>;
}

export interface CacheKeyParts {
  readonly namespace: string;
  readonly tenantId: string;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly version?: string;
}

/** Tenant/resource scope is required to reduce accidental cross-scope cache collisions. */
export function buildCacheKey(parts: CacheKeyParts): string {
  const fields = [parts.namespace, parts.tenantId, parts.resourceType, parts.resourceId, parts.version ?? "v1"];
  if (fields.some(value => value.trim().length === 0)) throw new TypeError("Cache key fields must be non-empty.");
  return fields.map(encodeURIComponent).join(":");
}
