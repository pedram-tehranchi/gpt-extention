import { describe, expect, it } from 'vitest';

import { clampKeepLatestTurns } from '@/types/settings';
import { selectNodesToPrune, selectTurnsToPrune } from '@/utils/pruneTurns';

describe('clampKeepLatestTurns', () => {
  it('clamps below min to 2', () => {
    expect(clampKeepLatestTurns(0)).toBe(2);
    expect(clampKeepLatestTurns(1)).toBe(2);
  });

  it('clamps above max to 200', () => {
    expect(clampKeepLatestTurns(201)).toBe(200);
    expect(clampKeepLatestTurns(999)).toBe(200);
  });

  it('floors fractional values', () => {
    expect(clampKeepLatestTurns(40.9)).toBe(40);
  });

  it('allows the configured minimum of 2', () => {
    expect(clampKeepLatestTurns(2)).toBe(2);
  });

  it('falls back for non-finite values', () => {
    expect(clampKeepLatestTurns(Number.NaN)).toBe(2);
    expect(clampKeepLatestTurns(Number.POSITIVE_INFINITY)).toBe(2);
  });
});

describe('selectTurnsToPrune', () => {
  it('returns empty when under or equal to keep limit', () => {
    expect(selectTurnsToPrune(['a', 'b', 'c'], 40)).toEqual([]);
    expect(selectTurnsToPrune(Array.from({ length: 40 }, (_, i) => i), 40)).toEqual([]);
  });

  it('returns oldest excess turns in order', () => {
    const turns = ['t1', 't2', 't3', 't4', 't5', 't6'];
    expect(selectTurnsToPrune(turns, 5)).toEqual(['t1']);
    expect(selectTurnsToPrune(turns, 5)).toHaveLength(1);
  });

  it('keeps only the latest N after prune selection', () => {
    const turns = Array.from({ length: 10 }, (_, i) => `t${i + 1}`);
    const prune = selectTurnsToPrune(turns, 5);
    expect(prune).toEqual(['t1', 't2', 't3', 't4', 't5']);
    const remaining = turns.slice(prune.length);
    expect(remaining).toEqual(['t6', 't7', 't8', 't9', 't10']);
  });
});

describe('selectNodesToPrune', () => {
  type Node = { id: string; rendered: boolean };
  const isCounted = (node: Node): boolean => node.rendered;

  it('returns empty when rendered count is under or equal to keep', () => {
    const nodes: Node[] = [
      { id: 'p1', rendered: false },
      { id: 'r1', rendered: true },
      { id: 'p2', rendered: false },
      { id: 'r2', rendered: true },
    ];
    expect(selectNodesToPrune(nodes, 2, isCounted)).toEqual([]);
    expect(selectNodesToPrune(nodes, 5, isCounted)).toEqual([]);
  });

  it('counts only rendered turns but removes older placeholders before cutoff', () => {
    // Document order: placeholder, R1, placeholder, R2, placeholder, R3, placeholder, R4
    const nodes: Node[] = [
      { id: 'p0', rendered: false },
      { id: 'r1', rendered: true },
      { id: 'p1', rendered: false },
      { id: 'r2', rendered: true },
      { id: 'p2', rendered: false },
      { id: 'r3', rendered: true },
      { id: 'p3', rendered: false },
      { id: 'r4', rendered: true },
    ];

    // Keep last 2 rendered (r3, r4). Cutoff is r3 → remove everything before r3.
    expect(selectNodesToPrune(nodes, 2, isCounted)).toEqual([
      { id: 'p0', rendered: false },
      { id: 'r1', rendered: true },
      { id: 'p1', rendered: false },
      { id: 'r2', rendered: true },
      { id: 'p2', rendered: false },
    ]);
  });

  it('leaves placeholders after the cutoff so the kept tail can still layout', () => {
    const nodes: Node[] = [
      { id: 'r1', rendered: true },
      { id: 'p-old', rendered: false },
      { id: 'r2', rendered: true },
      { id: 'r3', rendered: true },
      { id: 'p-tail', rendered: false },
      { id: 'r4', rendered: true },
    ];

    const prune = selectNodesToPrune(nodes, 2, isCounted);
    expect(prune.map((n) => n.id)).toEqual(['r1', 'p-old', 'r2']);
    const remaining = nodes.slice(prune.length);
    expect(remaining.map((n) => n.id)).toEqual(['r3', 'p-tail', 'r4']);
  });
});
