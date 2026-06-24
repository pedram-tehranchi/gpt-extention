import { onMessage } from '@/services/messaging';
import { getStorageItem, setStorageItem } from '@/services/storage';
import type { ExtensionResponse, StoragePayload } from '@/types/messages';
import { logger } from '@/utils/logger';

logger.info('Service worker started');

onMessage(async (message): Promise<ExtensionResponse> => {
  switch (message.type) {
    case 'PING':
      return { ok: true, data: 'pong' };

    case 'GET_STORAGE': {
      const { key } = message.payload as StoragePayload;
      const value = await getStorageItem(key);
      return { ok: true, data: value };
    }

    case 'SET_STORAGE': {
      const { key, value } = message.payload as StoragePayload;
      await setStorageItem(key, value);
      return { ok: true };
    }

    default:
      return { ok: false, error: `Unknown message type: ${message.type}` };
  }
});
