import { describe, expect, it } from 'vitest';
import { moveItem } from '@/utils/reorder';

describe('moveItem', () => {
  it('moves an item earlier in the list', () => {
    expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('moves an item later in the list', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
  });

  it('returns a copy when indices are unchanged', () => {
    const items = ['a', 'b'];
    const result = moveItem(items, 1, 1);
    expect(result).toEqual(['a', 'b']);
    expect(result).not.toBe(items);
  });

  it('returns a copy when indices are out of range', () => {
    const items = ['a', 'b'];
    expect(moveItem(items, -1, 0)).toEqual(['a', 'b']);
    expect(moveItem(items, 0, 5)).toEqual(['a', 'b']);
  });
});
