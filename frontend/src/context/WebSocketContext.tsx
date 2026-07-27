/**
 * WebSocketProvider
 * Provider de React para el WsManager de FastAPI
 * Gestiona conexión, salas, envío y recepción de eventos en tiempo real
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { ConnectionHandler, DisconnectionHandler, EventHandler, WsContextValue, WsEvent, WsStatus } from "../models/WebSockets";

const WsContext = createContext<WsContextValue | null>(null);

// ==================== Provider ====================

export interface WebSocketProviderProps {
  children: ReactNode;
  autoConnectUrl?: string;
  autoConnectClientId?: string;
  reconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export function WebSocketProvider({
  children,
  autoConnectUrl,
  autoConnectClientId,
  reconnect = true,
  reconnectDelay = 3000,
  maxReconnectAttempts = 5,
}: WebSocketProviderProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urlRef = useRef<string | null>(null);
  const clientIdRef = useRef<string | null>(null);
  const isManuallyClosed = useRef(false);

  const [status, setStatus] = useState<WsStatus>("disconnected");
  const [clientId, setClientId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Set<string>>(new Set());
  const [lastError, setLastError] = useState<string | null>(null);

  const eventHandlersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const connectionHandlersRef = useRef<Set<ConnectionHandler>>(new Set());
  const disconnectionHandlersRef = useRef<Set<DisconnectionHandler>>(new Set());

  // ==================== Envío ====================

  const send = useCallback((eventType: string, data?: unknown) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("[WsProvider] No hay conexión activa para enviar el evento:", eventType);
      return;
    }
    wsRef.current.send(JSON.stringify({
      event_type: eventType,
      data,
      sender_id: clientIdRef.current ?? undefined,
      timestamp: new Date().toISOString(),
    }));
  }, []);

  // ==================== Salas ====================

  const joinRoom = useCallback((room: string) => {
    send("join_room", { room });
    setRooms((prev) => new Set(prev).add(room));
  }, [send]);

  const leaveRoom = useCallback((room: string) => {
    send("leave_room", { room });
    setRooms((prev) => {
      const next = new Set(prev);
      next.delete(room);
      return next;
    });
  }, [send]);

  // ==================== Handlers ====================

  const onEvent = useCallback((eventType: string, handler: EventHandler): (() => void) => {
    if (!eventHandlersRef.current.has(eventType)) {
      eventHandlersRef.current.set(eventType, new Set());
    }
    eventHandlersRef.current.get(eventType)!.add(handler);
    return () => eventHandlersRef.current.get(eventType)?.delete(handler);
  }, []);

  const onConnection = useCallback((handler: ConnectionHandler): (() => void) => {
    connectionHandlersRef.current.add(handler);
    return () => connectionHandlersRef.current.delete(handler);
  }, []);

  const onDisconnection = useCallback((handler: DisconnectionHandler): (() => void) => {
    disconnectionHandlersRef.current.add(handler);
    return () => disconnectionHandlersRef.current.delete(handler);
  }, []);

  // ==================== Procesamiento de mensajes ====================

  const handleMessage = useCallback((raw: string) => {
    let event: WsEvent;
    try {
      event = JSON.parse(raw) as WsEvent;
    } catch {
      console.error("[WsProvider] Error parseando mensaje:", raw);
      return;
    }

    eventHandlersRef.current.get(event.event_type)?.forEach((h) => {
      try { h(event); } catch (err) { console.error(`[WsProvider] Error en handler de '${event.event_type}':`, err); }
    });

    // Wildcard: escucha todos los eventos
    eventHandlersRef.current.get("*")?.forEach((h) => {
      try { h(event); } catch (err) { console.error("[WsProvider] Error en handler wildcard:", err); }
    });
  }, []);

  // ==================== Conexión ====================

  const connectInternal = useCallback((url: string, id: string) => {
    if (wsRef.current) wsRef.current.close();

    setStatus("connecting");
    setLastError(null);

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      setStatus("connected");
      setClientId(id);
      connectionHandlersRef.current.forEach((h) => {
        try { h(); } catch (err) { console.error("[WsProvider] Error en handler de conexión:", err); }
      });
    };

    ws.onmessage = (ev) => handleMessage(ev.data as string);

    ws.onerror = (ev) => {
      console.error("[WsProvider] WebSocket error:", ev);
      setLastError("Error en la conexión WebSocket");
      setStatus("error");
    };

    ws.onclose = () => {
      setStatus("disconnected");
      setClientId(null);
      setRooms(new Set());

      disconnectionHandlersRef.current.forEach((h) => {
        try { h(); } catch (err) { console.error("[WsProvider] Error en handler de desconexión:", err); }
      });

      if (
        !isManuallyClosed.current &&
        reconnect &&
        (maxReconnectAttempts === -1 || reconnectAttemptsRef.current < maxReconnectAttempts)
      ) {
        reconnectAttemptsRef.current += 1;
        console.info(`[WsProvider] Reconectando en ${reconnectDelay}ms... (intento ${reconnectAttemptsRef.current})`);
        reconnectTimerRef.current = setTimeout(() => {
          connectInternal(urlRef.current!, clientIdRef.current!);
        }, reconnectDelay);
      }
    };
  }, [handleMessage, reconnect, reconnectDelay, maxReconnectAttempts]);

  const connect = useCallback((url: string, id: string) => {
    isManuallyClosed.current = false;
    urlRef.current = url;
    clientIdRef.current = id;
    connectInternal(url, id);
  }, [connectInternal]);

  const disconnect = useCallback(() => {
    isManuallyClosed.current = true;
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    wsRef.current?.close();
  }, []);

  // ==================== Auto-connect ====================

  useEffect(() => {
    if (autoConnectUrl && autoConnectClientId) {
      connect(autoConnectUrl, autoConnectClientId);
    }
    return () => {
      isManuallyClosed.current = true;
      clearTimeout(reconnectTimerRef.current ?? undefined);
      wsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== Valor del contexto ====================

  const value: WsContextValue = {
    status,
    clientId,
    rooms,
    connect,
    disconnect,
    send,
    joinRoom,
    leaveRoom,
    onEvent,
    onConnection,
    onDisconnection,
    lastError,
  };

  return <WsContext.Provider value={value}>{children}</WsContext.Provider>;
}

// ==================== Hook principal ====================

export function useWebSocket(): WsContextValue {
  const ctx = useContext(WsContext);
  if (!ctx) throw new Error("useWebSocket debe usarse dentro de <WebSocketProvider>");
  return ctx;
}

// ==================== Hooks derivados ====================

export function useWsEvent(eventType: string, handler: EventHandler): void {
  const { onEvent } = useWebSocket();
  useEffect(() => {
    const unsubscribe = onEvent(eventType, handler);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType, onEvent]);
}

export function useWsStatus(): Pick<WsContextValue, "status" | "clientId" | "lastError"> {
  const { status, clientId, lastError } = useWebSocket();
  return { status, clientId, lastError };
}

export function useWsSend(): { send: WsContextValue["send"]; isConnected: boolean } {
  const { send, status } = useWebSocket();
  return { send, isConnected: status === "connected" };
}

export function useWsRoom(room: string): void {
  const { joinRoom, leaveRoom, status } = useWebSocket();
  useEffect(() => {
    if (status !== "connected") return;
    joinRoom(room);
    return () => leaveRoom(room);
  }, [room, status, joinRoom, leaveRoom]);
}