import { ConversationTitle } from '@/components/ConversationTitle';
import { contentLog, getSettings } from '@/content/chromeApi';
import {
  isInvalidConversationTitle,
  resolveConversationTitle,
} from '@/utils/conversationTitle';

const UPDATE_DEBOUNCE_MS = 100;

export function initTitleBanner(): () => void {
  const banner = new ConversationTitle();
  banner.mount();

  let prefixToRemove = '';
  let bannerEnabled = true;
  let lastGoodTitle = 'New chat';
  let lastPathname = window.location.pathname;
  let debounceId: number | undefined;

  const updateTitleNow = (): void => {
    banner.mount();
    banner.setVisible(bannerEnabled);

    const resolved = resolveConversationTitle(prefixToRemove);
    if (!isInvalidConversationTitle(resolved)) {
      lastGoodTitle = resolved;
      banner.setTitle(resolved);
      return;
    }

    banner.setTitle(lastGoodTitle);
  };

  const updateTitle = (): void => {
    if (debounceId !== undefined) {
      window.clearTimeout(debounceId);
    }
    debounceId = window.setTimeout(() => {
      debounceId = undefined;
      updateTitleNow();
    }, UPDATE_DEBOUNCE_MS);
  };

  const loadSettings = async (): Promise<void> => {
    const settings = await getSettings();
    prefixToRemove = settings.titlePrefixToRemove;
    bannerEnabled = settings.titleBannerEnabled;
    updateTitleNow();
  };

  void loadSettings();

  const titleElement = document.querySelector('title');
  const titleObserver = titleElement
    ? new MutationObserver(updateTitle)
    : null;

  titleObserver?.observe(titleElement!, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  const isExtensionNode = (node: Node): boolean => {
    return (
      node instanceof HTMLElement &&
      (node.dataset.gptExtensionUi !== undefined ||
        node.id.startsWith('gpt-extension-'))
    );
  };

  const sidebarObserver = new MutationObserver((mutations) => {
    const relevant = mutations.some((mutation) => {
      if (isExtensionNode(mutation.target)) {
        return false;
      }
      if (mutation.type === 'attributes') {
        return true;
      }
      for (const node of mutation.addedNodes) {
        if (!isExtensionNode(node)) {
          return true;
        }
      }
      for (const node of mutation.removedNodes) {
        if (isExtensionNode(node)) {
          // ChatGPT (or something) removed our UI — remount immediately.
          return true;
        }
        if (!isExtensionNode(node)) {
          return true;
        }
      }
      return false;
    });

    if (relevant) {
      updateTitle();
    }
  });

  sidebarObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-active', 'aria-label', 'href'],
  });

  // Also watch documentElement in case our host is removed from there.
  const rootObserver = new MutationObserver(() => {
    if (!banner.isMounted()) {
      updateTitleNow();
    }
  });
  rootObserver.observe(document.documentElement, { childList: true });

  const onPopState = (): void => {
    updateTitleNow();
  };
  window.addEventListener('popstate', onPopState);

  const pathPollId = window.setInterval(() => {
    if (window.location.pathname !== lastPathname) {
      lastPathname = window.location.pathname;
      updateTitleNow();
    } else if (!banner.isMounted()) {
      updateTitleNow();
    }
  }, 500);

  const onStorageChange = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string,
  ): void => {
    if (area === 'local' && changes.settings) {
      void loadSettings();
    }
  };

  chrome.storage.onChanged.addListener(onStorageChange);

  updateTitleNow();
  contentLog.info('Title banner initialized');

  return () => {
    if (debounceId !== undefined) {
      window.clearTimeout(debounceId);
    }
    titleObserver?.disconnect();
    sidebarObserver.disconnect();
    rootObserver.disconnect();
    window.clearInterval(pathPollId);
    window.removeEventListener('popstate', onPopState);
    chrome.storage.onChanged.removeListener(onStorageChange);
    banner.unmount();
  };
}
