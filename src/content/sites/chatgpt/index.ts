import { initTemplateTrigger } from '@/content/sites/chatgpt/templateTrigger';
import { initTitleBanner } from '@/content/sites/chatgpt/titleBanner';
import { queryPromptTextarea } from '@/content/sites/chatgpt/selectors';
import type { SiteAdapter } from '@/types/site';
import { logger } from '@/utils/logger';

function isConversationPage(): boolean {
  if (window.location.pathname.startsWith('/c/')) {
    return true;
  }

  return queryPromptTextarea() !== null;
}

function waitForConversation(): Promise<void> {
  if (isConversationPage()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (isConversationPage()) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.setTimeout(() => {
      observer.disconnect();
      resolve();
    }, 10000);
  });
}

export const chatgptAdapter: SiteAdapter = {
  id: 'chatgpt',

  matches(url: URL): boolean {
    return url.hostname === 'chatgpt.com';
  },

  init(): () => void {
    let cleanups: Array<() => void> = [];
    let cancelled = false;

    void waitForConversation().then(() => {
      if (cancelled || !isConversationPage()) {
        logger.info('ChatGPT adapter skipped — not on a conversation page');
        return;
      }

      cleanups = [initTitleBanner(), initTemplateTrigger()];
      logger.info('ChatGPT adapter initialized');
    });

    return () => {
      cancelled = true;
      cleanups.forEach((cleanup) => cleanup());
      cleanups = [];
    };
  },
};
