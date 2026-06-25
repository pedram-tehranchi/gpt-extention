const ALLOW_BUTTON_TEXT = 'Allow';

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
