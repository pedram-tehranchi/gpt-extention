import { AutoAllowToggle } from '@/components/AutoAllowToggle';
import {
  contentLog,
  getSettings,
  isExtensionContextValid,
  offStorageChanged,
  onStorageChanged,
} from '@/content/chromeApi';
import { queryPromptHeader } from '@/content/sites/chatgpt/selectors';
import {
  clickAllowButtonIfNeeded,
  collectAllowButtonsFromNode,
  findAllowButtons,
} from '@/utils/allowButton';

export function initAutoAllow(toggle: AutoAllowToggle): () => void {
  const seenButtons = new WeakSet<HTMLButtonElement>();
  let enabled = false;

  const markExistingAsSeen = (): void => {
    for (const button of findAllowButtons()) {
      seenButtons.add(button);
    }
  };

  const clickPendingAllowButtons = (): void => {
    if (!enabled) {
      return;
    }

    for (const button of findAllowButtons()) {
      if (clickAllowButtonIfNeeded(button, seenButtons)) {
        contentLog.info('Auto-clicked Allow button');
      }
    }
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

      // Click immediately — requestAnimationFrame is paused in background tabs.
      if (clickAllowButtonIfNeeded(button, seenButtons)) {
        contentLog.info('Auto-clicked Allow button');
      } else {
        seenButtons.add(button);
      }
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

    clickPendingAllowButtons();
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
      toggle.syncEnabled(next.autoAllowEnabled);
      if (enabled) {
        clickPendingAllowButtons();
      }
    }
  };

  const onVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      clickPendingAllowButtons();
    }
  };

  onStorageChanged(onStorageChange);
  document.addEventListener('visibilitychange', onVisibilityChange);

  contentLog.info('Auto Allow observer initialized');

  return () => {
    observer.disconnect();
    offStorageChanged(onStorageChange);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

export function initAutoAllowToggle(): () => void {
  let toggle: AutoAllowToggle | null = null;
  let autoAllowCleanup: (() => void) | undefined;
  let currentHeader: HTMLElement | null = null;
  let stopped = false;

  const unmount = (): void => {
    autoAllowCleanup?.();
    autoAllowCleanup = undefined;
    toggle?.unmount();
    toggle = null;
    currentHeader = null;
  };

  const mount = (): void => {
    if (stopped || !isExtensionContextValid()) {
      stopped = true;
      unmount();
      return;
    }

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

  mount();

  const observer = new MutationObserver(() => {
    if (stopped || !isExtensionContextValid()) {
      stopped = true;
      observer.disconnect();
      unmount();
      return;
    }

    const header = queryPromptHeader();
    if (!header) {
      unmount();
      return;
    }
    mount();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    stopped = true;
    observer.disconnect();
    unmount();
  };
}
