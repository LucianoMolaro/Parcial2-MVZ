import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import { useAuthUser } from "../context/AuthContext";
import { getPedidos, cambiarEstadoPedido } from "../api/api";
import { Pedido } from "../types";
import { useWebSocket } from "../hooks/useWebSocket";

const COLORES: Record<string, { bg: string; text: string; label: string }> = {
  PENDIENTE:  { bg: "#78350f", text: "#fde68a", label: "Pendiente"      },
  CONFIRMADO: { bg: "#1e3a5f", text: "#93c5fd", label: "Confirmado"     },
  EN_PREP:    { bg: "#7c2d12", text: "#fdba74", label: "En preparación" },
  EN_CAMINO:  { bg: "#3b0764", text: "#d8b4fe", label: "En camino"      },
  ENTREGADO:  { bg: "#14532d", text: "#86efac", label: "Entregado"      },
  CANCELADO:  { bg: "#3f3f46", text: "#d4d4d8", label: "Cancelado"      },
};

const TRANSICIONES_ADMIN: Record<string, string[]> = {
  PENDIENTE:  ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EN_PREP",    "CANCELADO"],
  EN_PREP:    ["EN_CAMINO",  "CANCELADO"],
  EN_CAMINO:  ["ENTREGADO"],
};

const LABEL_ACCION: Record<string, string> = {
  CONFIRMADO: "Confirmar",
  EN_PREP:    "En preparación",
  EN_CAMINO:  "En camino",
  ENTREGADO:  "Entregar",
  CANCELADO:  "Cancelar",
};

export default function PedidosPage() {
  const { user } = useAuthUser();
  const qc = useQueryClient();
  const roles = user?.roles.map((r) => r.codigo) ?? [];
  const esOperador = roles.includes("ADMIN") || roles.includes("PEDIDOS");
  const esCliente = roles.includes("CLIENT") && !esOperador;

  const room = esOperador ? "pedidos_admin" : `pedido_${user?.id}`;
  const { lastEvent, conectado } = useWebSocket(room);

  useEffect(() => {
    if (lastEvent?.event_type === "pedido_estado_actualizado") {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
    }
  }, [lastEvent, qc]);

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ["pedidos"],
    queryFn: () => getPedidos({ limit: 50 }),
    enabled: !!user,
  });

  const cambiarMut = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) =>
      cambiarEstadoPedido(id, { estado_pedido_codigo: estado }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pedidos"] }),
    onError: (e: Error) => alert(e.message),
  });

  return (
    <div style={{ backgroundColor: "#1E2328", minHeight: "100vh" }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 style={{ color: "#F1DFC8" }} className="text-2xl font-bold">
            {esOperador ? "Gestión de pedidos" : "Mis pedidos"}
          </h1>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: conectado ? "#86efac" : "#f87171" }}
            />
            <span style={{ color: "#A6A29A" }} className="text-xs">
              {conectado ? "Tiempo real activo" : "Reconectando..."}
            </span>
          </div>
        </div>

        {isLoading ? (
          <p style={{ color: "#A6A29A" }} className="text-center py-16">Cargando...</p>
        ) : pedidos.length === 0 ? (
          <p style={{ color: "#A6A29A" }} className="text-center py-16">No hay pedidos</p>
        ) : (
          <div className="flex flex-col gap-4">
            {pedidos.map((pedido: Pedido) => (
              <TarjetaPedido
                key={pedido.id}
                pedido={pedido}
                esOperador={esOperador}
                esCliente={esCliente}
                onCambiar={(estado) => cambiarMut.mutate({ id: pedido.id, estado })}
                cargando={cambiarMut.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TarjetaProps {
  pedido: Pedido;
  esOperador: boolean;
  esCliente: boolean;
  onCambiar: (estado: string) => void;
  cargando: boolean;
}

function TarjetaPedido({ pedido, esOperador, esCliente, onCambiar, cargando }: TarjetaProps) {
  const color = COLORES[pedido.estado_codigo] ?? COLORES["CANCELADO"];

  const transiciones = esOperador
    ? (TRANSICIONES_ADMIN[pedido.estado_codigo] ?? [])
    : esCliente && ["PENDIENTE", "CONFIRMADO"].includes(pedido.estado_codigo)
    ? ["CANCELADO"]
    : [];

  return (
    <div
      className="rounded-lg p-5"
      style={{ backgroundColor: "#252B32", border: "1px solid #3a3f47" }}
    >
      <div className="flex justify-between items-start gap-4 flex-wrap">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span style={{ color: "#F1DFC8" }} className="font-bold text-base">
              Pedido #{pedido.id}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded font-semibold"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              {color.label}
            </span>
            <span style={{ color: "#A6A29A" }} className="text-xs">
              {pedido.forma_pago_codigo === "MERCADOPAGO_QR" ? "Mercado Pago QR" : "Efectivo"}
            </span>
          </div>

          {esOperador && (
            <span style={{ color: "#A6A29A" }} className="text-xs">
              Cliente ID: {pedido.usuario_id}
            </span>
          )}

          <div className="mt-1 flex flex-col gap-1">
            {pedido.detalles.map((d) => (
              <div key={d.id} className="flex gap-2 text-sm">
                <span style={{ color: "#A6A29A" }}>{d.cantidad}×</span>
                <span style={{ color: "#F1DFC8" }}>{d.nombre}</span>
                <span style={{ color: "#C96A3D" }} className="font-mono ml-auto">
                  ${Number(d.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {pedido.notas && (
            <p style={{ color: "#A6A29A" }} className="text-xs italic mt-1">
              "{pedido.notas}"
            </p>
          )}
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            {Number(pedido.costo_envio) > 0 && (
              <p style={{ color: "#A6A29A" }} className="text-xs">
                Envío: ${Number(pedido.costo_envio).toFixed(2)}
              </p>
            )}
            <p style={{ color: "#C96A3D" }} className="font-bold font-mono text-xl">
              ${Number(pedido.total).toFixed(2)}
            </p>
          </div>

          {transiciones.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-end">
              {transiciones.map((estado) => (
                <button
                  key={estado}
                  onClick={() => onCambiar(estado)}
                  disabled={cargando}
                  className="px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50 hover:opacity-80 transition-opacity"
                  style={
                    estado === "CANCELADO"
                      ? { backgroundColor: "#7f1d1d", color: "#fca5a5" }
                      : { backgroundColor: "#C96A3D", color: "#F1DFC8" }
                  }
                >
                  {LABEL_ACCION[estado] ?? estado}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
