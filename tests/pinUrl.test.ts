import { describe, expect, it } from 'vitest';
import { normalizePinUrl, pinUrlHostname } from '@/utils/pinUrl';

describe('normalizePinUrl', () => {
  it('accepts https URLs', () => {
    expect(normalizePinUrl('https://example.com/path')).toBe('https://example.com/path');
  });

  it('accepts http URLs', () => {
    expect(normalizePinUrl('http://example.com')).toBe('http://example.com/');
  });

  it('adds https when protocol is missing', () => {
    expect(normalizePinUrl('example.com/docs')).toBe('https://example.com/docs');
  });

  it('rejects non-http(s) schemes', () => {
    expect(normalizePinUrl('javascript:alert(1)')).toBeNull();
    expect(normalizePinUrl('ftp://files.example.com')).toBeNull();
  });

  it('rejects empty and invalid input', () => {
    expect(normalizePinUrl('')).toBeNull();
    expect(normalizePinUrl('   ')).toBeNull();
    expect(normalizePinUrl('not a url')).toBeNull();
  });
});

describe('pinUrlHostname', () => {
  it('returns hostname for valid URLs', () => {
    expect(pinUrlHostname('https://docs.example.com/a')).toBe('docs.example.com');
  });

  it('falls back to the raw string when parsing fails', () => {
    expect(pinUrlHostname('not-a-url')).toBe('not-a-url');
  });
});
