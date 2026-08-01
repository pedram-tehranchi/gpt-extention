/** True when pointer moved at least `threshold` px from the start point. */
export function exceededDragThreshold(
  startX: number,
  startY: number,
  x: number,
  y: number,
  threshold = 4,
): boolean {
  const dx = x - startX;
  const dy = y - startY;
  return dx * dx + dy * dy >= threshold * threshold;
}
