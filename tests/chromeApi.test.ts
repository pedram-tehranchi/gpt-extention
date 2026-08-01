// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CONTENT_DEFAULT_SETTINGS,
  contentLog,
  getSettings,
  getTemplates,
  resetContextInvalidatedWarningForTests,
  saveSettings,
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
      },
    });

    await expect(getTemplates()).resolves.toEqual([]);
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
      },
    });

    await expect(getTemplates()).resolves.toEqual([]);
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
});
