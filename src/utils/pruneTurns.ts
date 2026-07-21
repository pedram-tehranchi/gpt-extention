/**
 * Returns the oldest turns that should be removed so only `keepLatest` remain.
 * `turns` must be in document order (oldest first).
 */
export function selectTurnsToPrune<T>(turns: readonly T[], keepLatest: number): T[] {
  const keep = clampKeepLatest(keepLatest);
  if (turns.length <= keep) {
    return [];
  }

  return turns.slice(0, turns.length - keep);
}

/** Local clamp — avoid importing @/types/settings (shared SW/content chunk). */
function clampKeepLatest(value: number): number {
  if (!Number.isFinite(value)) {
    return 2;
  }
  return Math.min(200, Math.max(2, Math.floor(value)));
}
