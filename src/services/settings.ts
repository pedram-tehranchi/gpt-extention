import { getStorageItem, setStorageItem } from '@/services/storage';
import {
  DEFAULT_SETTINGS,
  type ExtensionSettings,
} from '@/types/settings';

const SETTINGS_KEY = 'settings';

export async function getSettings(): Promise<ExtensionSettings> {
  const stored = await getStorageItem<Partial<ExtensionSettings>>(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await setStorageItem(SETTINGS_KEY, settings);
}
