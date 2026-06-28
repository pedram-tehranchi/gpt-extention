import { onMessage } from '@/services/messaging';
import { getSettings, saveSettings } from '@/services/settings';
import { getTemplates } from '@/services/templates';
import type { ExtensionResponse } from '@/types/messages';
import type { ExtensionSettings } from '@/types/settings';

onMessage(async (message): Promise<ExtensionResponse> => {
  switch (message.type) {
    case 'PING':
      return { ok: true, data: 'pong' };

    case 'GET_SETTINGS':
      return { ok: true, data: await getSettings() };

    case 'SAVE_SETTINGS':
      await saveSettings(message.payload as ExtensionSettings);
      return { ok: true };

    case 'GET_TEMPLATES':
      return { ok: true, data: await getTemplates() };

    default:
      return { ok: false, error: `Unknown message type: ${message.type}` };
  }
});
