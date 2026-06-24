export const SELECTORS = {
  promptTextarea: '#prompt-textarea.ProseMirror',
  composerSurface: '[data-composer-surface="true"]',
  promptHeader: '[data-prompt-textarea-header=""]',
  conversationTurn: '[data-testid="conversation-turn"]',
} as const;

export function queryPromptTextarea(root: ParentNode = document): HTMLElement | null {
  return root.querySelector<HTMLElement>(SELECTORS.promptTextarea);
}

export function queryComposerSurface(root: ParentNode = document): HTMLElement | null {
  return root.querySelector<HTMLElement>(SELECTORS.composerSurface);
}

export function queryPromptHeader(root: ParentNode = document): HTMLElement | null {
  return root.querySelector<HTMLElement>(SELECTORS.promptHeader);
}
