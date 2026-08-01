import type { PinFloaterPosition, PinFloaterPositionLegacy } from '@/types/pin';

export function isEdgePinFloaterPosition(value: unknown): value is PinFloaterPosition {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.right === 'number' &&
    typeof record.bottom === 'number' &&
    Number.isFinite(record.right) &&
    Number.isFinite(record.bottom)
  );
}

export function isLegacyPinFloaterPosition(value: unknown): value is PinFloaterPositionLegacy {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.left === 'number' &&
    typeof record.top === 'number' &&
    Number.isFinite(record.left) &&
    Number.isFinite(record.top) &&
    !('right' in record && 'bottom' in record)
  );
}

export function absoluteToEdgePosition(
  left: number,
  top: number,
  floaterSize: number,
  viewportWidth: number,
  viewportHeight: number,
): PinFloaterPosition {
  return {
    right: Math.max(0, viewportWidth - left - floaterSize),
    bottom: Math.max(0, viewportHeight - top - floaterSize),
  };
}

export function edgeToAbsolutePosition(
  position: PinFloaterPosition,
  floaterSize: number,
  viewportWidth: number,
  viewportHeight: number,
): { left: number; top: number } {
  return {
    left: Math.max(8, viewportWidth - position.right - floaterSize),
    top: Math.max(8, viewportHeight - position.bottom - floaterSize),
  };
}

export function clampAbsolutePosition(
  left: number,
  top: number,
  floaterSize: number,
  viewportWidth: number,
  viewportHeight: number,
): { left: number; top: number } {
  const maxLeft = Math.max(8, viewportWidth - floaterSize - 8);
  const maxTop = Math.max(8, viewportHeight - floaterSize - 8);
  return {
    left: Math.min(Math.max(8, left), maxLeft),
    top: Math.min(Math.max(8, top), maxTop),
  };
}

/** Normalize any stored shape into edge insets for the current viewport. */
export function normalizeStoredPinFloaterPosition(
  stored: unknown,
  floaterSize: number,
  viewportWidth: number,
  viewportHeight: number,
): PinFloaterPosition | null {
  if (isEdgePinFloaterPosition(stored)) {
    return {
      right: Math.max(0, stored.right),
      bottom: Math.max(0, stored.bottom),
    };
  }

  if (isLegacyPinFloaterPosition(stored)) {
    const clamped = clampAbsolutePosition(
      stored.left,
      stored.top,
      floaterSize,
      viewportWidth,
      viewportHeight,
    );
    return absoluteToEdgePosition(
      clamped.left,
      clamped.top,
      floaterSize,
      viewportWidth,
      viewportHeight,
    );
  }

  return null;
}
