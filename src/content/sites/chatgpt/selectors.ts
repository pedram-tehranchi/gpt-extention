export const SELECTORS = {
  promptTextarea: '#prompt-textarea.ProseMirror',
  composerSurface: '[data-composer-surface="true"]',
  promptHeader: '[data-prompt-textarea-header=""]',
  /** Outer turn wrappers (includes virtualized placeholders). Nested sections also have this attr. */
  turnContainer:
    'div[data-turn-id-container]:not([data-turn-id-container="client-created-root"])',
  /** Rendered turn sections — ChatGPT uses conversation-turn-N, not conversation-turn. */
  conversationTurn: '[data-testid^="conversation-turn"]',
  sidebarItem: 'a[data-sidebar-item="true"]',
  activeSidebarItem: 'a[data-sidebar-item="true"][data-active]',
} as const;

const CONVERSATION_ID_PATH = /\/c\/([a-f0-9-]+)/i;

export function getConversationIdFromPath(pathname: string = window.location.pathname): string | null {
  const match = pathname.match(CONVERSATION_ID_PATH);
  return match?.[1] ?? null;
}

export function queryActiveSidebarItem(root: ParentNode = document): HTMLAnchorElement | null {
  return root.querySelector<HTMLAnchorElement>(SELECTORS.activeSidebarItem);
}

export function querySidebarItemByConversationId(
  conversationId: string,
  root: ParentNode = document,
): HTMLAnchorElement | null {
  const items = root.querySelectorAll<HTMLAnchorElement>(SELECTORS.sidebarItem);
  for (const item of items) {
    const href = item.getAttribute('href') ?? '';
    if (href.includes(`/c/${conversationId}`)) {
      return item;
    }
  }
  return null;
}

export function queryPromptTextarea(root: ParentNode = document): HTMLElement | null {
  return root.querySelector<HTMLElement>(SELECTORS.promptTextarea);
}

export function queryComposerSurface(root: ParentNode = document): HTMLElement | null {
  return root.querySelector<HTMLElement>(SELECTORS.composerSurface);
}

export function queryPromptHeader(root: ParentNode = document): HTMLElement | null {
  return root.querySelector<HTMLElement>(SELECTORS.promptHeader);
}

/**
 * Prefers outer turn containers when present; otherwise uses rendered turn sections.
 */
export function preferTurnElements(
  containers: HTMLElement[],
  sections: HTMLElement[],
): HTMLElement[] {
  return containers.length > 0 ? containers : sections;
}

/**
 * Returns conversation turns in document order (oldest first).
 * Prefers outer turn containers so virtualized placeholders are included.
 */
export function queryConversationTurns(root: ParentNode = document): HTMLElement[] {
  const containers = Array.from(
    root.querySelectorAll<HTMLElement>(SELECTORS.turnContainer),
  );
  const sections = Array.from(
    root.querySelectorAll<HTMLElement>(SELECTORS.conversationTurn),
  );
  return preferTurnElements(containers, sections);
}
