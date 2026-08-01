export interface Pin {
  id: string;
  name: string;
  url: string;
  createdAt: number;
}

export interface PinInput {
  name: string;
  url: string;
}

/**
 * Floater placement as distances from the viewport edges (shared across tabs).
 * Prefer edges over absolute left/top so restore is stable across window sizes.
 */
export interface PinFloaterPosition {
  right: number;
  bottom: number;
}

/** Legacy absolute placement (migrated on read). */
export interface PinFloaterPositionLegacy {
  left: number;
  top: number;
}
