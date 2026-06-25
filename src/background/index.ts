import { onMessage } from '@/services/messaging';
import type { ExtensionResponse } from '@/types/messages';

onMessage(async (message): Promise<ExtensionResponse> => {
  if (message.type === 'PING') {
    return { ok: true, data: 'pong' };
  }

  return { ok: false, error: `Unknown message type: ${message.type}` };
});
