export type MessageType = 'PING' | 'GET_SETTINGS' | 'SAVE_SETTINGS' | 'GET_TEMPLATES';

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload?: T;
}

export interface ExtensionResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}
