import { contentLog } from '@/content/chromeApi';
import { getMatchingAdapter } from '@/content/sites/registry';

const adapter = getMatchingAdapter();

if (adapter) {
  const cleanup = adapter.init();
  window.addEventListener('pagehide', cleanup);
  contentLog.info('Content script active', { site: adapter.id });
} else {
  contentLog.info('No site adapter matched', { url: window.location.href });
}
