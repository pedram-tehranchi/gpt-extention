import { ConversationTitle } from '@/components/ConversationTitle';
import { getSettings } from '@/services/extensionClient';
import { formatConversationTitle } from '@/utils/tabTitle';
import { logger } from '@/utils/logger';

export function initTitleBanner(): () => void {
  const banner = new ConversationTitle();
  banner.mount();

  let prefixToRemove = 'Daniel Brooks - ';

  const updateTitle = (): void => {
    banner.setTitle(formatConversationTitle(document.title, prefixToRemove));
  };

  const loadSettings = async (): Promise<void> => {
    const settings = await getSettings();
    prefixToRemove = settings.titlePrefixToRemove;
    updateTitle();
  };

  void loadSettings();

  const titleElement = document.querySelector('title');
  const titleObserver = titleElement
    ? new MutationObserver(updateTitle)
    : null;

  titleObserver?.observe(titleElement!, { childList: true, characterData: true, subtree: true });

  const onStorageChange = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string,
  ): void => {
    if (area === 'local' && changes.settings) {
      void loadSettings();
    }
  };

  chrome.storage.onChanged.addListener(onStorageChange);

  updateTitle();
  logger.info('Title banner initialized');

  return () => {
    titleObserver?.disconnect();
    chrome.storage.onChanged.removeListener(onStorageChange);
    banner.unmount();
  };
}
