export type MessageType = 'PING';

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload?: T;
}

export interface ExtensionResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}
