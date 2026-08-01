import { describe, expect, it } from 'vitest';
import {
  absoluteToEdgePosition,
  clampAbsolutePosition,
  edgeToAbsolutePosition,
  normalizeStoredPinFloaterPosition,
} from '@/utils/pinFloaterPosition';

describe('pinFloaterPosition', () => {
  it('converts absolute coords to shared edge insets', () => {
    expect(absoluteToEdgePosition(100, 200, 36, 1000, 800)).toEqual({
      right: 864,
      bottom: 564,
    });
  });

  it('restores absolute coords from edge insets', () => {
    expect(edgeToAbsolutePosition({ right: 20, bottom: 88 }, 36, 1000, 800)).toEqual({
      left: 944,
      top: 676,
    });
  });

  it('normalizes legacy left/top storage', () => {
    const normalized = normalizeStoredPinFloaterPosition(
      { left: 100, top: 200 },
      36,
      1000,
      800,
    );
    expect(normalized).toEqual({ right: 864, bottom: 564 });
  });

  it('accepts edge storage as-is', () => {
    expect(
      normalizeStoredPinFloaterPosition({ right: 40, bottom: 100 }, 36, 1000, 800),
    ).toEqual({ right: 40, bottom: 100 });
  });

  it('clamps absolute coords into the viewport', () => {
    expect(clampAbsolutePosition(-20, 9999, 36, 400, 300)).toEqual({
      left: 8,
      top: 256,
    });
  });
});
