/**
 * Array Safety Utility
 * Fixes: "e.filter is not a function" error
 */

/**
 * Ensures the input is always an array
 * Prevents "filter is not a function" errors
 */
export function ensureArray<T>(data: any): T[] {
  // If already an array, return it
  if (Array.isArray(data)) {
    return data;
  }
  
  // If null or undefined, return empty array
  if (data === null || data === undefined) {
    console.warn('ensureArray: Received null/undefined, returning []');
    return [];
  }
  
  // If it's an API response with data property
  if (typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
    return (data as any).data;
  }
  
  // If it's a single item, wrap in array
  console.warn('ensureArray: Wrapping single item in array');
  return [data];
}

/**
 * Safe filter - always returns an array
 */
export function safeFilter<T>(
  data: any,
  predicate: (value: T, index: number, array: T[]) => boolean
): T[] {
  const arr = ensureArray<T>(data);
  return arr.filter(predicate);
}

/**
 * Safe map - always returns an array
 */
export function safeMap<T, U>(
  data: any,
  callback: (value: T, index: number, array: T[]) => U
): U[] {
  const arr = ensureArray<T>(data);
  return arr.map(callback);
}
