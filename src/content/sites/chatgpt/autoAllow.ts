import { AutoAllowToggle } from '@/components/AutoAllowToggle';
import { contentLog, getSettings } from '@/content/chromeApi';
import { queryPromptHeader } from '@/content/sites/chatgpt/selectors';
import {
  collectAllowButtonsFromNode,
  findAllowButtons,
} from '@/utils/allowButton';

const AUTO_ALLOW_ATTR = 'data-gpt-extension-auto-allowed';

export function initAutoAllow(toggle: AutoAllowToggle): () => void {
  const seenButtons = new WeakSet<HTMLButtonElement>();
  let enabled = false;

  const markExistingAsSeen = (): void => {
    for (const button of findAllowButtons()) {
      seenButtons.add(button);
    }
  };

  const clickAllowButton = (button: HTMLButtonElement): void => {
    if (button.hasAttribute(AUTO_ALLOW_ATTR) || !button.isConnected) {
      return;
    }

    button.setAttribute(AUTO_ALLOW_ATTR, 'true');
    seenButtons.add(button);
    button.click();
    contentLog.info('Auto-clicked Allow button');
  };

  const handleNewButtons = (buttons: HTMLButtonElement[]): void => {
    if (!enabled) {
      for (const button of buttons) {
        seenButtons.add(button);
      }
      return;
    }

    for (const button of buttons) {
      if (seenButtons.has(button)) {
        continue;
      }

      seenButtons.add(button);
      window.requestAnimationFrame(() => {
        clickAllowButton(button);
      });
    }
  };

  const scanMutations = (mutations: MutationRecord[]): void => {
    const newButtons: HTMLButtonElement[] = [];

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        newButtons.push(...collectAllowButtonsFromNode(node));
      }
    }

    if (newButtons.length > 0) {
      handleNewButtons(newButtons);
    }
  };

  const observer = new MutationObserver(scanMutations);
  observer.observe(document.body, { childList: true, subtree: true });

  markExistingAsSeen();

  void getSettings().then((settings) => {
    enabled = settings.autoAllowEnabled;
  });

  toggle.onChange((nextEnabled) => {
    enabled = nextEnabled;

    if (!nextEnabled) {
      return;
    }

    for (const button of findAllowButtons()) {
      if (!seenButtons.has(button)) {
        handleNewButtons([button]);
      }
    }
  });

  const onStorageChange = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string,
  ): void => {
    if (area !== 'local' || !changes.settings) {
      return;
    }

    const next = changes.settings.newValue as { autoAllowEnabled?: boolean } | undefined;
    if (typeof next?.autoAllowEnabled === 'boolean') {
      enabled = next.autoAllowEnabled;
    }
  };

  chrome.storage.onChanged.addListener(onStorageChange);

    contentLog.info('Auto Allow observer initialized');

  return () => {
    observer.disconnect();
    chrome.storage.onChanged.removeListener(onStorageChange);
  };
}

export function initAutoAllowToggle(): () => void {
  let toggle: AutoAllowToggle | null = null;
  let autoAllowCleanup: (() => void) | undefined;
  let currentHeader: HTMLElement | null = null;

  const mount = (): void => {
    const header = queryPromptHeader();
    if (!header || header === currentHeader) {
      return;
    }

    autoAllowCleanup?.();
    currentHeader = header;

    toggle = new AutoAllowToggle();
    toggle.mount(header);
    autoAllowCleanup = initAutoAllow(toggle);
  };

  const unmount = (): void => {
    autoAllowCleanup?.();
    autoAllowCleanup = undefined;
    toggle?.unmount();
    toggle = null;
    currentHeader = null;
  };

  mount();

  const observer = new MutationObserver(() => {
    const header = queryPromptHeader();
    if (!header) {
      unmount();
      return;
    }
    mount();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    unmount();
  };
}
