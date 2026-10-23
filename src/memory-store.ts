import type { CacheJsonValue, CacheSetOptions, CacheStore } from "./contracts.js";

interface Entry {
  readonly serialized: string;
  readonly expiresAt: number;
}

/**
 * Bounded reference adapter for unit tests and local development only.
 * It is not distributed, durable, or suitable as a production cache backend.
 */
export class MemoryCacheStore implements CacheStore {
  private readonly entries = new Map<string, Entry>();

  constructor(
    private readonly options: {
      readonly maxEntries?: number;
      readonly maxValueBytes?: number;
      readonly now?: () => number;
    } = {}
  ) {
    const maxEntries = options.maxEntries ?? 1_000;
    const maxValueBytes = options.maxValueBytes ?? 256 * 1024;
    if (!Number.isInteger(maxEntries) || maxEntries < 1 || maxEntries > 100_000) {
      throw new RangeError("maxEntries must be an integer between 1 and 100000");
    }
    if (!Number.isInteger(maxValueBytes) || maxValueBytes < 1 || maxValueBytes > 10 * 1024 * 1024) {
      throw new RangeError("maxValueBytes must be an integer between 1 and 10485760");
    }
  }

  async get<T extends CacheJsonValue>(key: string): Promise<T | undefined> {
    this.validateKey(key);
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }
    // JSON round-tripping prevents callers from mutating the stored object by reference.
    return JSON.parse(entry.serialized) as T;
  }

  async set<T extends CacheJsonValue>(key: string, value: T, options: CacheSetOptions): Promise<void> {
    this.validateKey(key);
    if (!Number.isInteger(options.ttlMs) || options.ttlMs < 1 || options.ttlMs > 30 * 24 * 60 * 60 * 1000) {
      throw new RangeError("ttlMs must be an integer between 1 and 2592000000");
    }
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new TypeError("Cache values must be JSON-serializable.");
    const size = new TextEncoder().encode(serialized).byteLength;
    const maxValueBytes = this.options.maxValueBytes ?? 256 * 1024;
    if (size > maxValueBytes) throw new RangeError("Cache value exceeded the configured byte limit.");

    this.removeExpired();
    if (!this.entries.has(key) && this.entries.size >= (this.options.maxEntries ?? 1_000)) {
      // Map iteration order is insertion order; evict the oldest entry deterministically.
      const oldest = this.entries.keys().next().value as string | undefined;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.delete(key);
    this.entries.set(key, { serialized, expiresAt: this.now() + options.ttlMs });
  }

  async delete(key: string): Promise<boolean> {
    this.validateKey(key);
    return this.entries.delete(key);
  }

  async deleteByPrefix(prefix: string): Promise<number> {
    this.validateKey(prefix);
    let removed = 0;
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) {
        this.entries.delete(key);
        removed++;
      }
    }
    return removed;
  }

  private now(): number {
    return this.options.now?.() ?? Date.now();
  }

  private validateKey(key: string): void {
    if (typeof key !== "string" || key.trim().length === 0 || key.length > 2_048) {
      throw new TypeError("Cache key must be a non-empty string of at most 2048 characters.");
    }
  }

  private removeExpired(): void {
    const now = this.now();
    for (const [key, entry] of this.entries) {
      if (entry.expiresAt <= now) this.entries.delete(key);
    }
  }
}
