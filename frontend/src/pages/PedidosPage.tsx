import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPedidos, cambiarEstadoPedido } from "../api/api";
import { Pedido } from "../types";

const PAGE_SIZE = 7;

const ESTADOS_SIGUIENTES: Record<string, string[]> = {
  PENDIENTE:  ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EN_PREP",    "CANCELADO"],
  EN_PREP:    ["EN_CAMINO",  "CANCELADO"],
  EN_CAMINO:  ["ENTREGADO",  "CANCELADO"],
};

export default function PedidosPage() {
  const qc = useQueryClient();
  const rol = localStorage.getItem("rol") ?? "";
  const esAdmin = rol === "ADMIN" || rol === "PEDIDOS";
  const [page, setPage] = useState(0);

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ["pedidos", page],
    queryFn: () => getPedidos({ offset: page * PAGE_SIZE, limit: PAGE_SIZE }),
  });

  const cambiarMut = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) =>
      cambiarEstadoPedido(id, { estado_pedido_codigo: estado }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pedidos"] }),
  });

  if (isLoading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pedidos</h1>

      <table className="w-full border border-gray-200 rounded overflow-hidden text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Estado</th>
            <th className="p-2 text-left">Total</th>
            <th className="p-2 text-left">Pago</th>
            <th className="p-2 text-left">Productos</th>
            {esAdmin && <th className="p-2 text-left">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p: Pedido) => (
            <tr key={p.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{p.id}</td>
              <td className="p-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                  {p.estado_pedido_codigo}
                </span>
              </td>
              <td className="p-2">${p.total}</td>
              <td className="p-2">{p.forma_pago_codigo}</td>
              <td className="p-2 text-gray-500">
                {p.detalles.map((d) => `${d.nombre} x${d.cantidad}`).join(", ")}
              </td>
              {esAdmin && (
                <td className="p-2">
                  <div className="flex gap-1 flex-wrap">
                    {(ESTADOS_SIGUIENTES[p.estado_pedido_codigo] ?? []).map((e) => (
                      <button
                        key={e}
                        onClick={() => cambiarMut.mutate({ id: p.id, estado: e })}
                        className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs hover:bg-blue-600"
                      >
                        → {e}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
          {pedidos.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-400">Sin pedidos</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex gap-2 mt-4 items-center">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100"
        >
          ← Anterior
        </button>
        <span className="text-sm text-gray-600">Página {page + 1}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={pedidos.length < PAGE_SIZE}
          className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
