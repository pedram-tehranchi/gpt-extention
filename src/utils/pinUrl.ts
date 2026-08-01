/**
 * Normalize and validate pin URLs. Only http(s) are allowed.
 * Returns null when the URL is invalid.
 */
export function normalizePinUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const withProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

export function pinUrlHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
