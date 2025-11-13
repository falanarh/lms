/**
 * URL Utilities for Knowledge Center
 * Handles URL encoding, validation, and sanitization for media resources
 */

/**
 * Encodes URL by properly handling special characters including spaces
 * @param url - The URL to encode
 * @returns Properly encoded URL
 */
export function encodeMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  try {
    // If already a valid URL object, return as is
    const urlObj = new URL(url);
    
    // Encode the pathname to handle special characters
    const encodedPathname = urlObj.pathname
      .split('/')
      .map(segment => encodeURIComponent(decodeURIComponent(segment)))
      .join('/');
    
    // Reconstruct URL with encoded pathname
    urlObj.pathname = encodedPathname;
    
    return urlObj.toString();
  } catch {
    // If not a valid URL, treat as relative path and encode it
    return url
      .split('/')
      .map(segment => encodeURIComponent(decodeURIComponent(segment)))
      .join('/');
  }
}

/**
 * Validates if a URL is properly formatted and accessible
 * @param url - The URL to validate
 * @returns true if URL is valid
 */
export function isValidMediaUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  
  try {
    // Check if it's a valid URL
    new URL(url);
    return true;
  } catch {
    // Check if it's a valid relative path
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
}

/**
 * Sanitizes and encodes URL from API response
 * Handles common issues like spaces, special characters, etc.
 * @param url - The URL from API response
 * @returns Sanitized and encoded URL
 */
export function sanitizeApiUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  // Remove leading/trailing whitespace
  let sanitized = url.trim();
  
  // Replace multiple spaces with single space
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Encode the URL
  return encodeMediaUrl(sanitized);
}

/**
 * Gets a safe URL for use in img/video/audio tags
 * Returns empty string if URL is invalid
 * @param url - The URL to make safe
 * @returns Safe URL or empty string
 */
export function getSafeMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  const sanitized = sanitizeApiUrl(url);
  
  if (!isValidMediaUrl(sanitized)) {
    console.warn('Invalid media URL:', url);
    return '';
  }
  
  return sanitized;
}

/**
 * Encodes URL specifically for thumbnail images
 * @param url - The thumbnail URL
 * @returns Encoded thumbnail URL
 */
export function getThumbnailUrl(url: string | undefined | null): string {
  return getSafeMediaUrl(url);
}

/**
 * Encodes URL specifically for video sources
 * @param url - The video URL
 * @returns Encoded video URL
 */
export function getVideoUrl(url: string | undefined | null): string {
  return getSafeMediaUrl(url);
}

/**
 * Encodes URL specifically for audio sources
 * @param url - The audio URL
 * @returns Encoded audio URL
 */
export function getAudioUrl(url: string | undefined | null): string {
  return getSafeMediaUrl(url);
}

/**
 * Encodes URL specifically for PDF documents
 * @param url - The PDF URL
 * @returns Encoded PDF URL
 */
export function getPdfUrl(url: string | undefined | null): string {
  return getSafeMediaUrl(url);
}

/**
 * Checks if URL contains special characters that need encoding
 * @param url - The URL to check
 * @returns true if URL needs encoding
 */
export function urlNeedsEncoding(url: string): boolean {
  // Check for common special characters that need encoding
  const specialChars = /[^A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=]/;
  return specialChars.test(url);
}
