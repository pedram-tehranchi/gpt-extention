import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { reloadChatGptTabs } from '@/services/chatgptTabs';

describe('reloadChatGptTabs', () => {
  beforeEach(() => {
    vi.stubGlobal('chrome', {
      tabs: {
        query: vi.fn(),
        reload: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('reloads every matching ChatGPT tab', async () => {
    vi.mocked(chrome.tabs.query).mockResolvedValue([
      { id: 1 } as chrome.tabs.Tab,
      { id: 2 } as chrome.tabs.Tab,
      {} as chrome.tabs.Tab,
    ]);

    await reloadChatGptTabs();

    expect(chrome.tabs.query).toHaveBeenCalledWith({
      url: ['https://chatgpt.com/*', 'https://www.chatgpt.com/*'],
    });
    expect(chrome.tabs.reload).toHaveBeenCalledWith(1);
    expect(chrome.tabs.reload).toHaveBeenCalledWith(2);
    expect(chrome.tabs.reload).toHaveBeenCalledTimes(2);
  });

  it('does not throw when query fails', async () => {
    vi.mocked(chrome.tabs.query).mockRejectedValue(new Error('denied'));
    await expect(reloadChatGptTabs()).resolves.toBeUndefined();
  });
});
