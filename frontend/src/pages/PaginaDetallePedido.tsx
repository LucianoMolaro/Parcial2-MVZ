import React, { useEffect, useState } from 'react';
import BarraNavegacion from '../components/Navbar';
import { useParams } from 'react-router-dom';
import { useWsEvent } from '../context/WebSocketContext';
import { WsEvent } from '../models/WebSockets';
import { useAuthUser } from '../context/AuthContext';

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Confirmado',
  CONFIRMADO: 'Confirmado',
  EN_PREP: 'En preparación',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

interface DetallePedido {
  producto_id: number;
  cantidad: number;
  nombre: string;
  precio: string;
  subtotal: string;
  personalizacion_nombres: string[];
}

interface PedidoInfo {
  id: number;
  estado_codigo: string;
  created_at: string | null;
  direccion: { alias: string; calle1: string; altura: string; ciudad: string };
  forma_pago_codigo: string;
  subtotal: string;
  costo_envio: string;
  total: string;
  detalles: DetallePedido[];
}

export default function PaginaDetallePedido() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthUser();
    const [pedido, setPedido] = useState<PedidoInfo | null>(null);

    const esAdmin = user?.roles?.some(r => r.codigo === 'ADMIN' || r.codigo === 'PEDIDOS') ?? false;

    useEffect(() => {
      fetch(`http://localhost:8000/pedidos/${id}`, { credentials: 'include' })
        .then(r => r.json())
        .then(setPedido);
    }, [id]);

    useWsEvent('pedido_estado_actualizado', (evt: WsEvent) => {
      const d = evt.data as { pedido_id: number; estado_codigo: string };
      if (pedido && d.pedido_id === pedido.id) {
        setPedido(prev => prev ? { ...prev, estado_codigo: d.estado_codigo } : prev);
      }
    });

    if (!pedido) return <><BarraNavegacion /><div className="p-8 text-center text-sm text-gray-400">Cargando...</div></>;

    const estadoLabel = ESTADO_LABEL[pedido.estado_codigo] ?? pedido.estado_codigo;

    // Cálculos financieros automáticos
    const subtotal = Number(pedido.subtotal);
    const descuento = subtotal > 15 ? 2.50 : 0.00;
    const costoEnvio = Number(pedido.costo_envio);
    const total = Number(pedido.total);

    // Pasos del rastreador superior
    const pasos = ['Confirmado', 'En preparación', 'En camino', 'Entregado', 'Listo'];
    const indiceActual = pasos.indexOf(estadoLabel);

  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
        <div className="w-4/5 mx-auto space-y-7">

          {/* --- ENCABEZADO Y RASTREADOR DE ESTADO SUTIL --- */}
          <div className="bg-white rounded-xl border border-gray-100/70 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-50 pb-4 mb-4 gap-2">
              <div>
                <h1 className="text-xl font-black text-[#1E1E24] tracking-tight">Detalle del Pedido #{id}</h1>
                {/* ✅ CORREGIDO: Uso de && y llaves de cierre correctas */}
                {esAdmin && (
                    <div className="flex flex-wrap gap-x-2 text-s font-bold text-[#E63946] tracking-tight">
                        <span>Cliente: <span className="text-[#1E1E24] font-medium">ID: {pedido.usuario_id ?? '-'}</span></span>
                    </div>
                )}
                <p className="text-[12px] text-gray-400 font-medium">
                  {pedido.created_at ? new Date(pedido.created_at).toLocaleString('es-AR') : ''}
                </p>

              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider self-start sm:self-center">
                {estadoLabel}
              </span>
            </div>

            {/* Línea de tiempo visual (Stepper) */}
            <div className="grid grid-cols-5 gap-2 relative pt-2">
              {pasos.map((paso, index) => {
                const completado = index <= indiceActual;
                return (
                  <div key={paso} className="text-center space-y-2 flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-colors ${
                      completado
                        ? 'bg-[#E63946] text-white border-[#E63946]'
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`text-[10px] font-bold tracking-tight uppercase ${
                      completado ? 'text-[#1E1E24]' : 'text-gray-400'
                    }`}>
                      {paso}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- BLOQUE DE DISTRIBUCIÓN PRINCIPAL (65% / 35%) --- */}
          <div className="lg:flex lg:gap-6 items-start">

            {/* LADO IZQUIERDO: PRODUCTOS DEL PEDIDO (65%) */}
            <div className="w-full lg:w-2/3 space-y-3 mb-6 lg:mb-0">
              <h2 className="text-sm font-extrabold text-[#1E1E24] uppercase tracking-wider">Productos pedidos</h2>

              {pedido.detalles.map((detalle) => (
                <article
                  key={detalle.producto_id}
                  className="bg-white rounded-xl p-4 border border-gray-100/70 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-[#1E1E24] leading-tight">{detalle.nombre}</h3>
                    <p className="text-xs font-bold text-gray-400 mt-0.5">Cantidad: <span className="text-[#1E1E24]">{detalle.cantidad}</span></p>

                    {detalle.personalizacion_nombres.length > 0 && (
                      <p className="text-[10px] text-gray-400 font-medium mt-1">
                        🚫 Sin: {detalle.personalizacion_nombres.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-black text-[#1E1E24] block">
                      ${Number(detalle.subtotal).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium block">
                      ${Number(detalle.precio).toFixed(2)} c/u
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {/* LADO DERECHO: DETALLES DE ENTREGA Y MONTOS (35%) */}
            <div className="w-full lg:w-1/3 space-y-4">
              <h2 className="text-sm font-extrabold text-[#1E1E24] uppercase tracking-wider text-gray-400">Resumen y Logística</h2>

              <div className="bg-white rounded-xl border border-gray-100/70 shadow-xs p-5 space-y-4">

                {/* Datos de Entrega */}
                <div className="space-y-3 border-b border-gray-50 pb-3">
                  <div className="space-y-0.5">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dirección de Envío</h4>
                    <p className="text-xs font-semibold text-[#1E1E24]">
                      🏠 {pedido.direccion.alias} ({pedido.direccion.calle1} {pedido.direccion.altura}, {pedido.direccion.ciudad})
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Método de Pago</h4>
                    <p className="text-xs font-semibold text-[#1E1E24]">📱 {pedido.forma_pago_codigo}</p>
                  </div>
                </div>

                {/* Desglose Monetario */}
                <div className="space-y-2 text-xs font-medium text-gray-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#1E1E24] font-bold">${subtotal.toFixed(2)}</span>
                  </div>
                  {descuento > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Descuento aplicado</span>
                      <span className="font-bold">-${descuento.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Costo de envío</span>
                    <span className="text-[#1E1E24] font-bold">${costoEnvio.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total Final */}
                <div className="flex justify-between items-end pt-3 border-t border-gray-50">
                  <span className="text-xs font-bold text-[#1E1E24] uppercase tracking-wider">Total Pagado</span>
                  <span className="text-xl font-black text-[#1E1E24]">
                    ${total.toFixed(2)}
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
