import {
  contentLog,
  getSettings,
  offStorageChanged,
  onStorageChanged,
} from '@/content/chromeApi';

export const CONVERSATION_RTL_CLASS = 'gpt-extension-conversation-rtl';
export const CONVERSATION_RTL_STYLE_ID = 'gpt-extension-conversation-rtl';
export const FORCED_RTL_ATTR = 'data-gpt-extension-forced-rtl';

/**
 * ChatGPT no longer reliably emits data-testid=conversation-turn.
 * Scope to message roots that still appear in the live DOM.
 * Listed separately so CSS comma lists keep the html.class prefix on each.
 */
const MESSAGE_ROOTS = [
  '[data-markdown-text-style]',
  '[data-user-message-bubble]',
  '[data-testid^="conversation-turn"]',
] as const;

function withMessageRoots(suffix: string): string {
  return MESSAGE_ROOTS.map((root) =>
    suffix ? `html.${CONVERSATION_RTL_CLASS} ${root}${suffix}` : `html.${CONVERSATION_RTL_CLASS} ${root}`,
  ).join(',\n');
}

/** ChatGPT uses dir="auto", which flips to LTR when a block starts with English. */
const DIR_AUTO_SELECTOR = MESSAGE_ROOTS.flatMap((root) => [
  `${root} [dir="auto"]`,
  `${root}[dir="auto"]`,
]).join(', ');
const MARKDOWN_SELECTOR = '[data-markdown-text-style]';

const CONVERSATION_RTL_CSS = `
${withMessageRoots('')},
${withMessageRoots(' [dir="auto"]')},
${withMessageRoots('[dir="auto"]')} {
  direction: rtl !important;
  unicode-bidi: isolate !important;
  text-align: start;
}
${withMessageRoots(' pre')},
${withMessageRoots(' code')},
${withMessageRoots(' [dir="ltr"]')} {
  direction: ltr !important;
  unicode-bidi: isolate !important;
  text-align: left;
}
`.trim();
/** Ensures the page stylesheet exists (idempotent). Exported for tests. */
export function ensureConversationRtlStyles(root: ParentNode = document): HTMLStyleElement {
  const existing = root.querySelector<HTMLStyleElement>(`#${CONVERSATION_RTL_STYLE_ID}`);
  if (existing) {
    existing.textContent = CONVERSATION_RTL_CSS;
    return existing;
  }

  const style = document.createElement('style');
  style.id = CONVERSATION_RTL_STYLE_ID;
  style.textContent = CONVERSATION_RTL_CSS;
  const parent = root === document ? document.documentElement : root;
  parent.append(style);
  return style;
}

function forceDirRtl(el: Element): void {
  if (!(el instanceof HTMLElement)) {
    return;
  }
  if (el.getAttribute('dir') === 'ltr') {
    return;
  }
  if (el.getAttribute(FORCED_RTL_ATTR) === '1' && el.getAttribute('dir') === 'rtl') {
    return;
  }
  el.setAttribute(FORCED_RTL_ATTR, '1');
  el.setAttribute('dir', 'rtl');
}

function restoreForcedDirs(root: ParentNode = document): void {
  const forced = root.querySelectorAll(`[${FORCED_RTL_ATTR}]`);
  for (const el of forced) {
    el.setAttribute('dir', 'auto');
    el.removeAttribute(FORCED_RTL_ATTR);
  }
}

/**
 * Override ChatGPT's dir="auto" (and markdown roots) so English-leading
 * lines stay in an RTL paragraph base. Exported for tests.
 */
export function syncForcedRtlDirs(root: ParentNode = document): void {
  const nodes = root.querySelectorAll(`${DIR_AUTO_SELECTOR}, ${MARKDOWN_SELECTOR}`);
  for (const el of nodes) {
    forceDirRtl(el);
  }
}

/** Applies or removes the RTL class and dir overrides. Exported for tests. */
export function applyConversationRtl(
  enabled: boolean,
  root: HTMLElement = document.documentElement,
): void {
  root.classList.toggle(CONVERSATION_RTL_CLASS, enabled);
  if (enabled) {
    syncForcedRtlDirs(root.ownerDocument ?? document);
  } else {
    restoreForcedDirs(root.ownerDocument ?? document);
  }
}

export function initConversationRtl(): () => void {
  ensureConversationRtlStyles();
  let enabled = false;
  let observer: MutationObserver | undefined;

  const disconnectObserver = (): void => {
    observer?.disconnect();
    observer = undefined;
  };

  const ensureObserver = (): void => {
    if (observer || !document.body) {
      return;
    }
    observer = new MutationObserver(() => {
      if (enabled) {
        syncForcedRtlDirs();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['dir'],
    });
  };

  const apply = (next: boolean): void => {
    enabled = next;
    applyConversationRtl(next);
    if (next) {
      ensureObserver();
    } else {
      disconnectObserver();
    }
  };

  const loadSettings = async (): Promise<void> => {
    const settings = await getSettings();
    apply(settings.conversationRtlEnabled);
  };

  const onStorageChange = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string,
  ): void => {
    if (area === 'local' && changes.settings) {
      void loadSettings();
    }
  };

  onStorageChanged(onStorageChange);
  void loadSettings();
  contentLog.info('Conversation RTL initialized');

  return () => {
    offStorageChanged(onStorageChange);
    disconnectObserver();
    apply(false);
    document.getElementById(CONVERSATION_RTL_STYLE_ID)?.remove();
  };
}
