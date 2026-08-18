/**
 * Only allow ordinary web destinations in user/AI-controlled links.
 * This prevents javascript:, data:, blob:, and other executable schemes from
 * becoming navigation sinks in the frontend.
 */
export function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value, window.location.origin);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.href;
  } catch {
    return null;
  }
}
