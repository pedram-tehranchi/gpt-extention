import { logger } from '@/utils/logger';

export async function getStorageItem<T>(key: string): Promise<T | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as T | undefined;
}

export async function setStorageItem<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
  logger.debug('Storage updated', { key });
}

export async function removeStorageItem(key: string): Promise<void> {
  await chrome.storage.local.remove(key);
}
