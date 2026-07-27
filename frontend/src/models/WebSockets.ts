export interface WsEvent {
  event_type: string;
  data?: unknown;
  sender_id?: string;
  timestamp: string;
}

export type EventHandler = (event: WsEvent) => void;
export type ConnectionHandler = () => void;
export type DisconnectionHandler = () => void;

export type WsStatus = "connecting" | "connected" | "disconnected" | "error";

export interface WsContextValue {
  status: WsStatus;
  clientId: string | null;
  rooms: Set<string>;
  connect: (url: string, clientId: string) => void;
  disconnect: () => void;
  send: (eventType: string, data?: unknown) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  onEvent: (eventType: string, handler: EventHandler) => () => void;
  onConnection: (handler: ConnectionHandler) => () => void;
  onDisconnection: (handler: DisconnectionHandler) => () => void;
  lastError: string | null;
}
