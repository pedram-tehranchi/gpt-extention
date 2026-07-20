import { getStorageItem, setStorageItem } from '@/services/storage';
import {
  clampKeepLatestTurns,
  DEFAULT_SETTINGS,
  type ExtensionSettings,
} from '@/types/settings';

const SETTINGS_KEY = 'settings';

function normalizeSettings(settings: ExtensionSettings): ExtensionSettings {
  return {
    ...settings,
    keepLatestTurns: clampKeepLatestTurns(settings.keepLatestTurns),
  };
}

export async function getSettings(): Promise<ExtensionSettings> {
  const stored = await getStorageItem<Partial<ExtensionSettings>>(SETTINGS_KEY);
  return normalizeSettings({ ...DEFAULT_SETTINGS, ...stored });
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await setStorageItem(SETTINGS_KEY, normalizeSettings(settings));
}
