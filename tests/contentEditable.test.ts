import { describe, expect, it } from 'vitest';

import { normalizeNewlines } from '@/utils/contentEditable';

describe('normalizeNewlines', () => {
  it('normalizes Windows line endings', () => {
    expect(normalizeNewlines('line1\r\nline2')).toBe('line1\nline2');
  });

  it('preserves Unix line endings', () => {
    expect(normalizeNewlines('line1\nline2\nline3')).toBe('line1\nline2\nline3');
  });
});
