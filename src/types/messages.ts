export type MessageType = 'PING' | 'GET_STORAGE' | 'SET_STORAGE';

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload?: T;
}

export interface ExtensionResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface StoragePayload {
  key: string;
  value?: unknown;
}
