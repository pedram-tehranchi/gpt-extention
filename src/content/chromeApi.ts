import type { ExtensionSettings } from '@/types/settings';
import type { Pin, PinFloaterPosition, PinFloaterPositionLegacy, PinInput } from '@/types/pin';
import type { Template } from '@/types/template';
import { normalizePinUrl } from '@/utils/pinUrl';

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
const PINS_KEY = 'pins';
const PIN_FLOATER_POSITION_KEY = 'pinFloaterPosition';
const LOG_PREFIX = '[GPT Extension]';

export type StorageChangedListener = (
  changes: Record<string, chrome.storage.StorageChange>,
  area: string,
) => void;

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

export function isExtensionContextInvalidatedMessage(message: string): boolean {
  return message.includes('Extension context invalidated');
}

function isContextInvalidatedError(error: unknown): boolean {
  return isExtensionContextInvalidatedMessage(formatUnknownError(error));
}

export function warnContextInvalidatedOnce(): void {
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

export function onStorageChanged(listener: StorageChangedListener): void {
  if (!isExtensionContextValid()) {
    warnContextInvalidatedOnce();
    return;
  }

  try {
    chrome.storage.onChanged.addListener(listener);
  } catch (error) {
    if (isContextInvalidatedError(error)) {
      warnContextInvalidatedOnce();
      return;
    }
    throw error;
  }
}

export function offStorageChanged(listener: StorageChangedListener): void {
  if (!isExtensionContextValid()) {
    warnContextInvalidatedOnce();
    return;
  }

  try {
    chrome.storage.onChanged.removeListener(listener);
  } catch (error) {
    if (isContextInvalidatedError(error)) {
      warnContextInvalidatedOnce();
      return;
    }
    throw error;
  }
}

export function installContextInvalidationSafetyNet(): void {
  const handleRejection = (event: PromiseRejectionEvent): void => {
    if (!isContextInvalidatedError(event.reason)) {
      return;
    }
    warnContextInvalidatedOnce();
    event.preventDefault();
  };

  const handleError = (event: ErrorEvent): void => {
    const message = event.message || formatUnknownError(event.error);
    if (!isExtensionContextInvalidatedMessage(message)) {
      return;
    }
    warnContextInvalidatedOnce();
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  window.addEventListener('unhandledrejection', handleRejection);
  window.addEventListener('error', handleError);
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

export async function getPins(): Promise<Pin[]> {
  if (!isExtensionContextValid()) {
    warnContextInvalidatedOnce();
    return [];
  }

  try {
    const result = await chrome.storage.local.get(PINS_KEY);
    return (result[PINS_KEY] as Pin[] | undefined) ?? [];
  } catch (error) {
    if (isContextInvalidatedError(error)) {
      warnContextInvalidatedOnce();
      return [];
    }
    contentLog.warn('Failed to load pins from storage', {
      error: formatUnknownError(error),
    });
    return [];
  }
}

export async function savePin(input: PinInput): Promise<Pin | null> {
  if (!isExtensionContextValid()) {
    warnContextInvalidatedOnce();
    return null;
  }

  const url = normalizePinUrl(input.url);
  if (!url) {
    throw new Error('Enter a valid http(s) URL.');
  }

  const name = input.name.trim();
  if (!name) {
    throw new Error('Enter a pin name.');
  }

  try {
    const result = await chrome.storage.local.get(PINS_KEY);
    const pins = (result[PINS_KEY] as Pin[] | undefined) ?? [];
    const pin: Pin = {
      id: crypto.randomUUID(),
      name,
      url,
      createdAt: Date.now(),
    };
    pins.push(pin);
    await chrome.storage.local.set({ [PINS_KEY]: pins });
    return pin;
  } catch (error) {
    if (isContextInvalidatedError(error)) {
      warnContextInvalidatedOnce();
      return null;
    }
    contentLog.warn('Failed to save pin', {
      error: formatUnknownError(error),
    });
    throw error instanceof Error ? error : new Error('Could not save pin.');
  }
}

export async function reorderPins(orderedIds: string[]): Promise<Pin[] | null> {
  if (!isExtensionContextValid()) {
    warnContextInvalidatedOnce();
    return null;
  }

  try {
    const result = await chrome.storage.local.get(PINS_KEY);
    const pins = (result[PINS_KEY] as Pin[] | undefined) ?? [];
    if (orderedIds.length !== pins.length) {
      return pins;
    }

    const byId = new Map(pins.map((pin) => [pin.id, pin]));
    const reordered: Pin[] = [];

    for (const id of orderedIds) {
      const pin = byId.get(id);
      if (!pin) {
        return pins;
      }
      reordered.push(pin);
      byId.delete(id);
    }

    if (byId.size > 0) {
      return pins;
    }

    await chrome.storage.local.set({ [PINS_KEY]: reordered });
    return reordered;
  } catch (error) {
    if (isContextInvalidatedError(error)) {
      warnContextInvalidatedOnce();
      return null;
    }
    contentLog.warn('Failed to reorder pins', {
      error: formatUnknownError(error),
    });
    return null;
  }
}

export async function getPinFloaterPosition(): Promise<PinFloaterPosition | PinFloaterPositionLegacy | null> {
  if (!isExtensionContextValid()) {
    warnContextInvalidatedOnce();
    return null;
  }

  try {
    const result = await chrome.storage.local.get(PIN_FLOATER_POSITION_KEY);
    const stored = result[PIN_FLOATER_POSITION_KEY] as unknown;
    if (!stored || typeof stored !== 'object') {
      return null;
    }
    return stored as PinFloaterPosition | PinFloaterPositionLegacy;
  } catch (error) {
    if (isContextInvalidatedError(error)) {
      warnContextInvalidatedOnce();
      return null;
    }
    contentLog.warn('Failed to load pin floater position', {
      error: formatUnknownError(error),
    });
    return null;
  }
}

export async function savePinFloaterPosition(position: PinFloaterPosition): Promise<void> {
  if (!isExtensionContextValid()) {
    warnContextInvalidatedOnce();
    return;
  }

  try {
    await chrome.storage.local.set({ [PIN_FLOATER_POSITION_KEY]: position });
  } catch (error) {
    if (isContextInvalidatedError(error)) {
      warnContextInvalidatedOnce();
      return;
    }
    contentLog.warn('Failed to save pin floater position', {
      error: formatUnknownError(error),
    });
  }
}
