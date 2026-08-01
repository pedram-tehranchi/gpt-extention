import { describe, expect, it } from 'vitest';
import { exceededDragThreshold } from '@/utils/dragThreshold';

describe('exceededDragThreshold', () => {
  it('is false for tiny movement', () => {
    expect(exceededDragThreshold(10, 10, 12, 12)).toBe(false);
  });

  it('is true once movement reaches the default threshold', () => {
    expect(exceededDragThreshold(0, 0, 4, 0)).toBe(true);
    expect(exceededDragThreshold(0, 0, 3, 3)).toBe(true);
  });

  it('respects a custom threshold', () => {
    expect(exceededDragThreshold(0, 0, 5, 0, 8)).toBe(false);
    expect(exceededDragThreshold(0, 0, 8, 0, 8)).toBe(true);
  });
});
