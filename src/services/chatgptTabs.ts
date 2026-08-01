import { logger } from '@/utils/logger';

const CHATGPT_TAB_URLS = ['https://chatgpt.com/*', 'https://www.chatgpt.com/*'];

/**
 * Reloads every open ChatGPT tab so prune keep-N changes apply to a fresh DOM.
 * Soft-fails per tab; never throws after a successful settings save.
 */
export async function reloadChatGptTabs(): Promise<void> {
  let tabs: chrome.tabs.Tab[];

  try {
    tabs = await chrome.tabs.query({ url: CHATGPT_TAB_URLS });
  } catch (error) {
    logger.warn('Could not query ChatGPT tabs for reload', {
      error: error instanceof Error ? error.message : String(error),
    });
    return;
  }

  await Promise.all(
    tabs.map(async (tab) => {
      if (tab.id === undefined) {
        return;
      }

      try {
        await chrome.tabs.reload(tab.id);
      } catch (error) {
        logger.warn('Could not reload ChatGPT tab', {
          tabId: tab.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }),
  );
}
