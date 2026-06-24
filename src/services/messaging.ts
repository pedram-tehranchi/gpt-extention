import type { ExtensionMessage, ExtensionResponse } from '@/types/messages';

export function sendMessage<TResponse = unknown>(
  message: ExtensionMessage,
): Promise<ExtensionResponse<TResponse>> {
  return chrome.runtime.sendMessage(message);
}

export function onMessage(
  handler: (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
  ) => Promise<ExtensionResponse> | ExtensionResponse | void,
): void {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const result = handler(message as ExtensionMessage, sender);

    if (result instanceof Promise) {
      result.then(sendResponse).catch((error: unknown) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      });
      return true;
    }

    if (result !== undefined) {
      sendResponse(result);
    }

    return false;
  });
}
