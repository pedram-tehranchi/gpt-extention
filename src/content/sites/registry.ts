import { chatgptAdapter } from '@/content/sites/chatgpt';
import type { SiteAdapter } from '@/types/site';

const adapters: SiteAdapter[] = [chatgptAdapter];

export function getMatchingAdapter(url: URL = new URL(window.location.href)): SiteAdapter | null {
  return adapters.find((adapter) => adapter.matches(url)) ?? null;
}

export function getRegisteredAdapters(): SiteAdapter[] {
  return [...adapters];
}
