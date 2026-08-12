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

/**
 * Keep-N applies only to nodes where `isCounted` is true (e.g. rendered turns).
 * Returns all nodes before the first of the last N counted nodes, including
 * uncounted placeholders that sit before that cutoff.
 * `nodes` must be in document order (oldest first).
 */
export function selectNodesToPrune<T>(
  nodes: readonly T[],
  keepLatest: number,
  isCounted: (node: T) => boolean,
): T[] {
  const keep = clampKeepLatest(keepLatest);
  const countedIndexes: number[] = [];

  for (let i = 0; i < nodes.length; i++) {
    if (isCounted(nodes[i]!)) {
      countedIndexes.push(i);
    }
  }

  if (countedIndexes.length <= keep) {
    return [];
  }

  const cutoffIndex = countedIndexes[countedIndexes.length - keep]!;
  return nodes.slice(0, cutoffIndex);
}

/** Local clamp — avoid importing @/types/settings (shared SW/content chunk). */
function clampKeepLatest(value: number): number {
  if (!Number.isFinite(value)) {
    return 2;
  }
  return Math.min(200, Math.max(2, Math.floor(value)));
}
