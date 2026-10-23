export const CACHE_KEY_CONTRACT_VERSION = "1.0";
export const DEFAULT_CACHE_TTL_SECONDS = 60;
export const MAX_CACHE_TTL_SECONDS = 86_400;
const MAX_KEY_LENGTH = 512;

function requiredText(value, field, max = 200) {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > max) {
    throw new TypeError(`${field} must be a non-empty string of at most ${max} characters`);
  }
  return value;
}

function encodePart(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, character =>
    "%" + character.charCodeAt(0).toString(16).toUpperCase()
  );
}

/**
 * Build a deterministic tenant/resource-scoped cache key.
 * The tenant ID must come from trusted, already-authorized server context,
 * not from an untrusted client header by itself.
 */
export function createCacheKey({ namespace, tenantId, resourceType, resourceId, variant = "default" } = {}) {
  requiredText(namespace, "namespace", 80);
  requiredText(tenantId, "tenantId", 200);
  requiredText(resourceType, "resourceType", 100);
  requiredText(resourceId, "resourceId", 200);
  requiredText(variant, "variant", 100);
  const key = [
    "aether",
    CACHE_KEY_CONTRACT_VERSION,
    encodePart(namespace),
    encodePart(tenantId),
    encodePart(resourceType),
    encodePart(resourceId),
    encodePart(variant),
  ].join(":");
  if (key.length > MAX_KEY_LENGTH) throw new RangeError("cache key exceeds 512 characters");
  return key;
}

export function validateCacheTtl(ttlSeconds, { min = 1, max = MAX_CACHE_TTL_SECONDS } = {}) {
  if (!Number.isInteger(ttlSeconds) || ttlSeconds < min || ttlSeconds > max) {
    throw new RangeError(`ttlSeconds must be an integer between ${min} and ${max}`);
  }
  return ttlSeconds;
}

/** Cache only reconstructible data; never use a cache result as the authority for access. */
export function cachePolicy({ ttlSeconds = DEFAULT_CACHE_TTL_SECONDS, sensitive = false, authoritative = false } = {}) {
  validateCacheTtl(ttlSeconds);
  if (sensitive) throw new TypeError("sensitive values must not be cached by this default policy");
  if (authoritative) throw new TypeError("authoritative permissions, billing, audit, and durable-run state must not be cached as authority");
  return Object.freeze({
    contractVersion: CACHE_KEY_CONTRACT_VERSION,
    ttlSeconds,
    cacheable: true,
    authorizationRequiredOnRead: true,
    authoritative: false,
  });
}
