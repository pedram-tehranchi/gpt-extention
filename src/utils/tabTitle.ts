const CHATGPT_SUFFIX = ' - ChatGPT';

export function formatConversationTitle(
  rawTitle: string,
  prefixToRemove: string,
): string {
  let title = rawTitle;

  if (prefixToRemove && title.startsWith(prefixToRemove)) {
    title = title.slice(prefixToRemove.length);
  }

  title = title.trim();

  if (title.endsWith(CHATGPT_SUFFIX)) {
    title = title.slice(0, -CHATGPT_SUFFIX.length).trim();
  }

  return title || 'New chat';
}
