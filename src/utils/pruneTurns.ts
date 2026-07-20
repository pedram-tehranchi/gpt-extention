import { clampKeepLatestTurns } from '@/types/settings';

/**
 * Returns the oldest turns that should be removed so only `keepLatest` remain.
 * `turns` must be in document order (oldest first).
 */
export function selectTurnsToPrune<T>(turns: readonly T[], keepLatest: number): T[] {
  const keep = clampKeepLatestTurns(keepLatest);
  if (turns.length <= keep) {
    return [];
  }

  return turns.slice(0, turns.length - keep);
}
