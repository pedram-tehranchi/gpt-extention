const ALLOW_BUTTON_TEXT = 'Allow';

export const AUTO_ALLOW_ATTR = 'data-gpt-extension-auto-allowed';

export function isAllowButtonText(text: string): boolean {
  return text.trim() === ALLOW_BUTTON_TEXT;
}

export function isAllowButton(button: HTMLButtonElement): boolean {
  return isAllowButtonText(button.textContent ?? '');
}

export function findAllowButtons(root: ParentNode = document): HTMLButtonElement[] {
  return [...root.querySelectorAll<HTMLButtonElement>('button')].filter(isAllowButton);
}

export function collectAllowButtonsFromNode(node: Node): HTMLButtonElement[] {
  if (node instanceof HTMLButtonElement && isAllowButton(node)) {
    return [node];
  }

  if (node instanceof Element) {
    return findAllowButtons(node);
  }

  return [];
}

/**
 * Clicks an Allow button once. Returns true if a click was performed.
 * Safe to call from background tabs (no requestAnimationFrame).
 */
export function clickAllowButtonIfNeeded(
  button: HTMLButtonElement,
  seenButtons: WeakSet<HTMLButtonElement>,
): boolean {
  if (!button.isConnected) {
    return false;
  }

  if (button.hasAttribute(AUTO_ALLOW_ATTR)) {
    seenButtons.add(button);
    return false;
  }

  button.setAttribute(AUTO_ALLOW_ATTR, 'true');
  seenButtons.add(button);
  button.click();
  return true;
}
