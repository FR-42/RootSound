/**
 * Snapshot already validated JSON without serializing immutable strings such as
 * embedded audio. Objects/arrays remain independent, including __proto__ keys.
 * Optional non-JSON fields retain JSON's omission/null semantics.
 */
function omitted(value: unknown): boolean {
  return value === undefined || typeof value === 'function' || typeof value === 'symbol';
}
export function copyJson<T>(value: T): T {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return (Number.isFinite(value) ? value === 0 ? 0 : value : null) as T;
  if (Array.isArray(value)) return Array.from(value, item => omitted(item) ? null : copyJson(item)) as T;
  if (typeof value !== 'object') return JSON.parse(JSON.stringify(value)) as T;
  if (Object.getPrototypeOf(value) !== Object.prototype || typeof (value as { toJSON?: unknown }).toJSON === 'function') {
    return JSON.parse(JSON.stringify(value)) as T;
  }
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    const item = (value as Record<string, unknown>)[key];
    if (omitted(item)) continue;
    if (key === '__proto__') Object.defineProperty(result, key, { value: copyJson(item), enumerable: true, writable: true, configurable: true });
    else result[key] = copyJson(item);
  }
  return result as T;
}

/** Equality of validated JSON snapshots, retaining serialized key order. */
export function sameJson(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object') {
    return typeof left === 'number' && !Number.isFinite(left) && right === null
      || typeof right === 'number' && !Number.isFinite(right) && left === null;
  }
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length
      && Array.from(left).every((item, index) => sameJson(omitted(item) ? null : item, omitted(right[index]) ? null : right[index]));
  }
  if (Object.getPrototypeOf(left) !== Object.prototype || Object.getPrototypeOf(right) !== Object.prototype
    || typeof (left as { toJSON?: unknown }).toJSON === 'function' || typeof (right as { toJSON?: unknown }).toJSON === 'function') {
    return JSON.stringify(left) === JSON.stringify(right);
  }
  const keys = Object.keys(left).filter(key => !omitted((left as Record<string, unknown>)[key]));
  const other = Object.keys(right).filter(key => !omitted((right as Record<string, unknown>)[key]));
  return keys.length === other.length && keys.every((key, index) => key === other[index]
    && sameJson((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key]));
}
