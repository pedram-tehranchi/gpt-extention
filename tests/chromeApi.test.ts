// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CONTENT_DEFAULT_SETTINGS,
  contentLog,
  getPins,
  getSettings,
  getTemplates,
  installContextInvalidationSafetyNet,
  isExtensionContextInvalidatedMessage,
  offStorageChanged,
  onStorageChanged,
  resetContextInvalidatedWarningForTests,
  saveSettings,
  warnContextInvalidatedOnce,
} from '@/content/chromeApi';

describe('chromeApi extension context', () => {
  beforeEach(() => {
    resetContextInvalidatedWarningForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    resetContextInvalidatedWarningForTests();
  });

  it('returns safe defaults when chrome.runtime.id is missing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.stubGlobal('chrome', {
      runtime: {},
      storage: {
        local: {
          get: vi.fn(),
          set: vi.fn(),
        },
        onChanged: {
          addListener: vi.fn(),
          removeListener: vi.fn(),
        },
      },
    });

    await expect(getTemplates()).resolves.toEqual([]);
    await expect(getPins()).resolves.toEqual([]);
    await expect(getSettings()).resolves.toEqual(CONTENT_DEFAULT_SETTINGS);
    await expect(
      saveSettings({ ...CONTENT_DEFAULT_SETTINGS, autoAllowEnabled: true }),
    ).resolves.toBeUndefined();

    expect(chrome.storage.local.get).not.toHaveBeenCalled();
    expect(chrome.storage.local.set).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[1])).toContain('Refresh this ChatGPT tab');
  });

  it('returns safe defaults when storage throws Extension context invalidated', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.stubGlobal('chrome', {
      runtime: { id: 'test-extension-id' },
      storage: {
        local: {
          get: vi.fn().mockRejectedValue(new Error('Extension context invalidated.')),
          set: vi.fn().mockRejectedValue(new Error('Extension context invalidated.')),
        },
        onChanged: {
          addListener: vi.fn(),
          removeListener: vi.fn(),
        },
      },
    });

    await expect(getTemplates()).resolves.toEqual([]);
    await expect(getPins()).resolves.toEqual([]);
    await expect(getSettings()).resolves.toEqual(CONTENT_DEFAULT_SETTINGS);
    await expect(
      saveSettings({ ...CONTENT_DEFAULT_SETTINGS, autoAllowEnabled: true }),
    ).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[1])).toContain('Refresh this ChatGPT tab');
  });

  it('stringifies log context so Chrome error UI can show the message', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    contentLog.warn('Failed to load templates from storage', {
      error: 'Extension context invalidated.',
    });

    expect(warn).toHaveBeenCalledWith(
      '[GPT Extension]',
      'Failed to load templates from storage {"error":"Extension context invalidated."}',
    );
  });

  it('no-ops storage change listeners when runtime.id is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const addListener = vi.fn();
    const removeListener = vi.fn();

    vi.stubGlobal('chrome', {
      runtime: {},
      storage: {
        onChanged: { addListener, removeListener },
      },
    });

    expect(() => onStorageChanged(vi.fn())).not.toThrow();
    expect(() => offStorageChanged(vi.fn())).not.toThrow();
    expect(addListener).not.toHaveBeenCalled();
    expect(removeListener).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('swallows addListener Extension context invalidated errors', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.stubGlobal('chrome', {
      runtime: { id: 'test-extension-id' },
      storage: {
        onChanged: {
          addListener: vi.fn(() => {
            throw new Error('Extension context invalidated.');
          }),
          removeListener: vi.fn(),
        },
      },
    });

    expect(() => onStorageChanged(vi.fn())).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[1])).toContain('Refresh this ChatGPT tab');
  });

  it('detects invalidated context messages for the safety net', () => {
    expect(
      isExtensionContextInvalidatedMessage('Extension context invalidated.'),
    ).toBe(true);
    expect(isExtensionContextInvalidatedMessage('unrelated')).toBe(false);
  });

  it('installs safety net listeners and warns once for invalidated context', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const addEventListener = vi.spyOn(window, 'addEventListener');

    installContextInvalidationSafetyNet();

    expect(addEventListener).toHaveBeenCalledWith(
      'unhandledrejection',
      expect.any(Function),
    );
    expect(addEventListener).toHaveBeenCalledWith('error', expect.any(Function));

    warnContextInvalidatedOnce();
    warnContextInvalidatedOnce();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[1])).toContain('Refresh this ChatGPT tab');
  });
});
