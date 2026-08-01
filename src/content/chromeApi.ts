import type { ExtensionSettings } from '@/types/settings';
import type { Template } from '@/types/template';

/** Duplicated from types/settings so content does not share a runtime chunk with the SW. */
export const CONTENT_DEFAULT_SETTINGS: ExtensionSettings = {
  titlePrefixToRemove: '',
  titleBannerEnabled: true,
  autoAllowEnabled: false,
  pruneOldTurnsEnabled: true,
  keepLatestTurns: 10,
};

const SETTINGS_KEY = 'settings';
const TEMPLATES_KEY = 'templates';
const LOG_PREFIX = '[GPT Extension]';

let warnedContextInvalidated = false;

function formatLogEntry(message: string, context?: Record<string, unknown>): string {
  return context ? `${message} ${JSON.stringify(context)}` : message;
}

export const contentLog = {
  info(message: string, context?: Record<string, unknown>): void {
    console.info(LOG_PREFIX, formatLogEntry(message, context));
  },
  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(LOG_PREFIX, formatLogEntry(message, context));
  },
  error(message: string, context?: Record<string, unknown>): void {
    console.error(LOG_PREFIX, formatLogEntry(message, context));
  },
};

export function isExtensionContextValid(): boolean {
  try {
    return Boolean(chrome.runtime?.id);
  } catch {
    return false;
  }
}

export function formatUnknownError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function isContextInvalidatedError(error: unknown): boolean {
  const message = formatUnknownError(error);
  return message.includes('Extension context invalidated');
}

function warnContextInvalidatedOnce(): void {
  if (warnedContextInvalidated) {
    return;
  }
  warnedContextInvalidated = true;
  contentLog.warn(
    'Extension was reloaded or updated. Refresh this ChatGPT tab to keep using GPT Extension.',
  );
}

/** Reset one-shot warn flag (tests only). */
export function resetContextInvalidatedWarningForTests(): void {
  warnedContextInvalidated = false;
}

export async function getSettings(): Promise<ExtensionSettings> {
  if (!isExtensionContextValid()) {
    warnContextInvalidatedOnce();
    return { ...CONTENT_DEFAULT_SETTINGS };
  }

  try {
    const result = await chrome.storage.local.get(SETTINGS_KEY);
    const stored = result[SETTINGS_KEY] as Partial<ExtensionSettings> | undefined;
    return { ...CONTENT_DEFAULT_SETTINGS, ...stored };
  } catch (error) {
    if (isContextInvalidatedError(error)) {
      warnContextInvalidatedOnce();
      return { ...CONTENT_DEFAULT_SETTINGS };
    }
    contentLog.warn('Failed to load settings from storage', {
      error: formatUnknownError(error),
    });
    return { ...CONTENT_DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  if (!isExtensionContextValid()) {
    warnContextInvalidatedOnce();
    return;
  }

  try {
    await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  } catch (error) {
    if (isContextInvalidatedError(error)) {
      warnContextInvalidatedOnce();
      return;
    }
    contentLog.warn('Failed to save settings to storage', {
      error: formatUnknownError(error),
    });
  }
}

export async function getTemplates(): Promise<Template[]> {
  if (!isExtensionContextValid()) {
    warnContextInvalidatedOnce();
    return [];
  }

  try {
    const result = await chrome.storage.local.get(TEMPLATES_KEY);
    return (result[TEMPLATES_KEY] as Template[] | undefined) ?? [];
  } catch (error) {
    if (isContextInvalidatedError(error)) {
      warnContextInvalidatedOnce();
      return [];
    }
    contentLog.warn('Failed to load templates from storage', {
      error: formatUnknownError(error),
    });
    return [];
  }
}
