import {
  getConversationIdFromPath,
  queryActiveSidebarItem,
  querySidebarItemByConversationId,
} from '@/content/sites/chatgpt/selectors';
import { formatConversationTitle } from '@/utils/tabTitle';

const PINNED_ARIA_SUFFIX = ', pinned conversation';
const DASH_ONLY = /^-+$/;

/**
 * Strips ChatGPT's ", pinned conversation" suffix from sidebar aria-labels.
 */
export function cleanSidebarAriaLabel(ariaLabel: string): string {
  const trimmed = ariaLabel.trim();
  if (trimmed.toLowerCase().endsWith(PINNED_ARIA_SUFFIX)) {
    return trimmed.slice(0, -PINNED_ARIA_SUFFIX.length).trim();
  }
  return trimmed;
}

/**
 * Placeholders like "----" are not useful conversation titles.
 */
export function isInvalidConversationTitle(title: string): boolean {
  const trimmed = title.trim();
  return trimmed.length === 0 || DASH_ONLY.test(trimmed);
}

export function extractTitleFromSidebarItem(item: HTMLAnchorElement): string | null {
  const span = item.querySelector<HTMLElement>('span[dir="auto"]');
  const fromSpan = span?.textContent?.trim() ?? '';
  if (fromSpan && !isInvalidConversationTitle(fromSpan)) {
    return fromSpan;
  }

  const ariaLabel = item.getAttribute('aria-label');
  if (ariaLabel) {
    const cleaned = cleanSidebarAriaLabel(ariaLabel);
    if (cleaned && !isInvalidConversationTitle(cleaned)) {
      return cleaned;
    }
  }

  return null;
}

export function resolveActiveSidebarItem(
  pathname: string = window.location.pathname,
  root: ParentNode = document,
): HTMLAnchorElement | null {
  const active = queryActiveSidebarItem(root);
  if (active) {
    return active;
  }

  const conversationId = getConversationIdFromPath(pathname);
  if (!conversationId) {
    return null;
  }

  return querySidebarItemByConversationId(conversationId, root);
}

/**
 * Prefer sidebar active title; fall back to document.title.
 */
export function resolveConversationTitle(
  prefixToRemove: string,
  options: {
    pathname?: string;
    documentTitle?: string;
    root?: ParentNode;
  } = {},
): string {
  const pathname = options.pathname ?? window.location.pathname;
  const documentTitle = options.documentTitle ?? document.title;
  const root = options.root ?? document;

  const sidebarItem = resolveActiveSidebarItem(pathname, root);
  if (sidebarItem) {
    const sidebarTitle = extractTitleFromSidebarItem(sidebarItem);
    if (sidebarTitle && !isInvalidConversationTitle(sidebarTitle)) {
      // Sidebar titles are already the conversation name; skip document-title prefix logic.
      return sidebarTitle;
    }
  }

  const fromDocument = formatConversationTitle(documentTitle, prefixToRemove);
  if (!isInvalidConversationTitle(fromDocument)) {
    return fromDocument;
  }

  return 'New chat';
}
