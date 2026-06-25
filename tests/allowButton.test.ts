import { describe, expect, it } from 'vitest';

import { isAllowButtonText } from '@/utils/allowButton';

describe('isAllowButtonText', () => {
  it('matches Allow button text', () => {
    expect(isAllowButtonText('Allow')).toBe(true);
  });

  it('matches Allow with surrounding whitespace', () => {
    expect(isAllowButtonText('  Allow  ')).toBe(true);
  });

  it('rejects Deny button', () => {
    expect(isAllowButtonText('Deny')).toBe(false);
  });

  it('rejects partial matches', () => {
    expect(isAllowButtonText('Allow all')).toBe(false);
  });
});
