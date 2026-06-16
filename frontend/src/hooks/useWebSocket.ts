import { useEffect, useRef, useState } from "react";
import { useAuthUser } from "../context/AuthContext";

export interface WsEvent {
  event_type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export function useWebSocket(room: string) {
  const { user } = useAuthUser();
  const wsRef = useRef<WebSocket | null>(null);
  const [lastEvent, setLastEvent] = useState<WsEvent | null>(null);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    if (!user) return;

    const clientId = `user_${user.id}_${Date.now()}`;

    function conectar() {
      const ws = new WebSocket(`ws://localhost:8000/ws/${clientId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConectado(true);
        ws.send(JSON.stringify({ event_type: "join_room", data: { room } }));
      };

      ws.onmessage = (e) => {
        try {
          const event: WsEvent = JSON.parse(e.data);
          setLastEvent(event);
        } catch {
          // mensaje no-JSON, ignorar
        }
      };

      ws.onclose = () => {
        setConectado(false);
        // reconectar tras 3 segundos
        setTimeout(conectar, 3000);
      };

      ws.onerror = () => ws.close();
    }

    conectar();

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, room]);

  return { lastEvent, conectado };
}
