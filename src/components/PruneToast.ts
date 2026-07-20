import contentStyles from '@/styles/content.css?inline';
import { withExtensionFonts } from '@/styles/extensionFonts';

const TOAST_DURATION_MS = 2000;
const TOAST_FADE_MS = 200;

export function showPruneToast(message: string): void {
  const existing = document.getElementById('gpt-extension-prune-toast');
  existing?.remove();

  const host = document.createElement('div');
  host.id = 'gpt-extension-prune-toast';
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:10002;';

  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = withExtensionFonts(contentStyles);
  shadow.append(style);

  const toast = document.createElement('div');
  toast.className = 'prune-toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  shadow.append(toast);

  document.body.append(host);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.setTimeout(() => {
    if (!reduceMotion) {
      toast.classList.add('prune-toast--hiding');
    }
    window.setTimeout(
      () => {
        host.remove();
      },
      reduceMotion ? 0 : TOAST_FADE_MS,
    );
  }, TOAST_DURATION_MS);
}
