import { sendMessage } from '@/services/messaging';
import type { ExtensionSettings } from '@/types/settings';
import type { Template } from '@/types/template';

export async function getSettings(): Promise<ExtensionSettings> {
  const response = await sendMessage<ExtensionSettings>({ type: 'GET_SETTINGS' });
  if (!response.ok || response.data === undefined) {
    throw new Error(response.error ?? 'Failed to load settings');
  }
  return response.data;
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  const response = await sendMessage({ type: 'SAVE_SETTINGS', payload: settings });
  if (!response.ok) {
    throw new Error(response.error ?? 'Failed to save settings');
  }
}

export async function getTemplates(): Promise<Template[]> {
  const response = await sendMessage<Template[]>({ type: 'GET_TEMPLATES' });
  if (!response.ok || response.data === undefined) {
    throw new Error(response.error ?? 'Failed to load templates');
  }
  return response.data;
}
