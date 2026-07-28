import { useEffect, useRef, useState } from "react";

export default function PaginaSincronizacion() {
    const socket = useRef<WebSocket | null>(null);

    const [estado, setEstado] = useState("Desconectado");
    const [mensajes, setMensajes] = useState<any[]>([]);
    

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws/prueba");

        socket.current = ws;

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            console.log("Mensaje recibido:", data);

            setMensajes((prev) => [...prev, data]);
        };

        ws.onerror = (e) => {
            console.error(e);
        };

        ws.onclose = () => {
            console.log("Desconectado");
            setEstado("Desconectado");
        };

        return () => {
            ws.close();
        };
    }, []);

    function enviarMensaje() {
        fetch("http:localhost:8000/ws/mensaje")
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>Prueba WebSocket</h1>

            <p>Estado: {estado}</p>

            <button onClick={enviarMensaje}>
                Enviar mensaje
            </button>

            <hr />

            {mensajes.map((m, i) => (
                <pre key={i}>
                    {JSON.stringify(m, null, 2)}
                </pre>
            ))}
        </div>
    );
}