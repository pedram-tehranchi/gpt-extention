import { PinFloater } from '@/components/PinFloater';
import { contentLog } from '@/content/chromeApi';

export function initPinnedUrls(): () => void {
  const floater = new PinFloater();
  let cleanup: (() => void) | null = null;
  let cancelled = false;
  let rootObserver: MutationObserver | null = null;
  let pollId: number | undefined;

  const remountIfNeeded = (): void => {
    if (cancelled) {
      return;
    }
    if (!floater.isMounted()) {
      floater.ensureMounted();
    }
  };

  void floater.mount().then((unmount) => {
    if (cancelled) {
      unmount();
      return;
    }
    cleanup = unmount;

    // ChatGPT sometimes removes unknown nodes from <html>; remount like the title banner.
    rootObserver = new MutationObserver(remountIfNeeded);
    rootObserver.observe(document.documentElement, { childList: true });

    pollId = window.setInterval(remountIfNeeded, 500);

    contentLog.info('Pinned URLs floater mounted');
  });

  return () => {
    cancelled = true;
    rootObserver?.disconnect();
    rootObserver = null;
    if (pollId !== undefined) {
      window.clearInterval(pollId);
      pollId = undefined;
    }
    cleanup?.();
    cleanup = null;
  };
}
