import { queryPromptTextarea } from '@/content/sites/chatgpt/selectors';

export function observeComposer(onComposer: (textarea: HTMLElement) => () => void): () => void {
  let cleanup: (() => void) | undefined;
  let currentTextarea: HTMLElement | null = null;

  const bind = (): void => {
    const textarea = queryPromptTextarea();
    if (!textarea || textarea === currentTextarea) {
      return;
    }

    cleanup?.();
    currentTextarea = textarea;
    cleanup = onComposer(textarea);
  };

  const unbind = (): void => {
    cleanup?.();
    cleanup = undefined;
    currentTextarea = null;
  };

  bind();

  const observer = new MutationObserver(() => {
    const textarea = queryPromptTextarea();
    if (!textarea) {
      unbind();
      return;
    }
    bind();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    unbind();
  };
}
