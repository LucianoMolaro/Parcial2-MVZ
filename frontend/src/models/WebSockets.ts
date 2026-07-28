export interface WsEvent {
  event_type: string;
  data: any;
}

export interface WsContextType{
  lastEvent: WsEvent | null
}
