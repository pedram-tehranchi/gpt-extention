/**
 * Content script entry point.
 * Not registered in manifest yet — add a content_scripts block when you need page injection.
 */
import { logger } from '@/utils/logger';

logger.info('Content script loaded', { url: window.location.href });
