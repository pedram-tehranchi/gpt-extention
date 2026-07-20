export interface ExtensionSettings {
  titlePrefixToRemove: string;
  titleBannerEnabled: boolean;
  autoAllowEnabled: boolean;
  pruneOldTurnsEnabled: boolean;
  keepLatestTurns: number;
}

export const KEEP_LATEST_TURNS_MIN = 2;
export const KEEP_LATEST_TURNS_MAX = 200;

export const DEFAULT_SETTINGS: ExtensionSettings = {
  titlePrefixToRemove: '',
  titleBannerEnabled: true,
  autoAllowEnabled: false,
  pruneOldTurnsEnabled: true,
  keepLatestTurns: 10,
};

export function clampKeepLatestTurns(value: number): number {
  if (!Number.isFinite(value)) {
    return KEEP_LATEST_TURNS_MIN;
  }

  return Math.min(
    KEEP_LATEST_TURNS_MAX,
    Math.max(KEEP_LATEST_TURNS_MIN, Math.floor(value)),
  );
}
