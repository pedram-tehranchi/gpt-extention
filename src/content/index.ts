import { getMatchingAdapter } from '@/content/sites/registry';
import { logger } from '@/utils/logger';

const adapter = getMatchingAdapter();

if (adapter) {
  const cleanup = adapter.init();
  window.addEventListener('pagehide', cleanup);
  logger.info('Content script active', { site: adapter.id });
} else {
  logger.info('No site adapter matched', { url: window.location.href });
}
