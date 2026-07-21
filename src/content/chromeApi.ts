import type { ExtensionSettings } from '@/types/settings';
import type { Template } from '@/types/template';

/** Duplicated from types/settings so content does not share a runtime chunk with the SW. */
const CONTENT_DEFAULT_SETTINGS: ExtensionSettings = {
  titlePrefixToRemove: '',
  titleBannerEnabled: true,
  autoAllowEnabled: false,
  pruneOldTurnsEnabled: true,
  keepLatestTurns: 10,
};

const SETTINGS_KEY = 'settings';
const TEMPLATES_KEY = 'templates';
const LOG_PREFIX = '[GPT Extension]';

export const contentLog = {
  info(message: string, context?: Record<string, unknown>): void {
    if (context) {
      console.info(LOG_PREFIX, message, context);
      return;
    }
    console.info(LOG_PREFIX, message);
  },
  warn(message: string, context?: Record<string, unknown>): void {
    if (context) {
      console.warn(LOG_PREFIX, message, context);
      return;
    }
    console.warn(LOG_PREFIX, message);
  },
  error(message: string, context?: Record<string, unknown>): void {
    if (context) {
      console.error(LOG_PREFIX, message, context);
      return;
    }
    console.error(LOG_PREFIX, message);
  },
};

export async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  const stored = result[SETTINGS_KEY] as Partial<ExtensionSettings> | undefined;
  return { ...CONTENT_DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

export async function getTemplates(): Promise<Template[]> {
  const result = await chrome.storage.local.get(TEMPLATES_KEY);
  return (result[TEMPLATES_KEY] as Template[] | undefined) ?? [];
}
