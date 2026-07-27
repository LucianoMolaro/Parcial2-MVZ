import { useEffect, useState } from 'react';
import BarraNavegacion from '../components/Navbar';
import { useCarrito } from '../context/CarritoContext';
import { Producto } from '../models/Producto';
import { useWsEvent } from '../context/WebSocketContext';
import { WsEvent } from '../models/WebSockets';

interface Direccion { id: number; alias: string; calle1: string; altura: string; ciudad: string; }

export default function PaginaCarrito() {
  const { state, incrementar, decrementar, eliminar, quitarIngrediente, restaurarIngrediente, resetear } = useCarrito();
  const [sinStock, setSinStock] = useState<Set<number>>(new Set());
  const [productosDetalle, setProductosDetalle] = useState<Producto[]>([]);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [direccionId, setDireccionId] = useState('');
  const [formaPago, setFormaPago] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (state.items.length === 0) return;
    fetch('http://localhost:8000/productos/', { credentials: 'include' })
      .then(r => r.json())
      .then(setProductosDetalle)
      .catch(() => {});
  }, [state.items.length]);

  useEffect(() => {
    fetch('http://localhost:8000/direcciones/', { credentials: 'include' })
      .then(r => r.json())
      .then(setDirecciones)
      .catch(() => {});
  }, []);

  useWsEvent('producto_sin_stock', (evt: WsEvent) => {
    const d = evt.data as { producto_id: number };
    setSinStock(prev => new Set([...prev, d.producto_id]));
  });

  const itemsCarrito = state.items
    .map((item) => ({
      ...item,
      producto: productosDetalle.find((p) => p.id === item.id),
    }))
    .filter((item) => item.producto !== undefined) as Array<{
      id: number;
      cantidad: number;
      personalizacion: number[];
      producto: Producto;
    }>;

  const subtotal  = itemsCarrito.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  const descuento = subtotal > 15 ? 2.50 : 0.00;
  const costoEnvio = subtotal > 0 ? 1.99 : 0.00;
  const total = subtotal - descuento + costoEnvio;

  const personalizarProducto = (nombre: string) => {
    alert(`Abrir modal de personalización para: ${nombre} (Quitar cebolla, pepinillos, aderezos...)`);
  };

  const irAPagar = async () => {
    if (!direccionId || !formaPago || itemsCarrito.length === 0) return;
    setCargando(true);
    const body = {
      productos: itemsCarrito.map(i => ({ id: i.id, cantidad: i.cantidad, personalizacion: i.personalizacion })),
      direccion: Number(direccionId),
      forma_pago: formaPago,
    };
    const res = await fetch('http://localhost:8000/pedidos/crear', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);
    setCargando(false);
    if (!res || !res.ok) return;
    const pedido = await res.json();
    resetear();
    if (formaPago === 'MERCADOPAGO' && pedido.init_point) {
      window.location.href = pedido.init_point;
    } else {
      window.location.href = '/pedidos';
    }
  };

  const botonDeshabilitado = itemsCarrito.length === 0 || itemsCarrito.some(item => sinStock.has(item.id)) || !direccionId || !formaPago || cargando;

  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8">

        <div className="w-4/5 mx-auto lg:flex lg:gap-8 items-start">

          {/* ── LADO IZQUIERDO: LISTADO DE PRODUCTOS ── */}
          <div className="w-full lg:w-2/3 space-y-4 mb-6 lg:mb-0">
            <h1 className="text-xl font-extrabold text-[#1E1E24] tracking-tight mb-2">
              Tu Carrito <span className="text-[#E63946]">({itemsCarrito.length} artículos)</span>
            </h1>

            {itemsCarrito.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100/60 p-8 text-center text-xs font-medium text-gray-400">
                Tu carrito está vacío. ¡Agrega tus antojos favoritos en el menú!
              </div>
            ) : (
              itemsCarrito.map((item) => {
                return (
                  <article
                    key={item.id}
                    className="bg-white rounded-xl p-3 border border-gray-100/60 shadow-xs flex items-center justify-between gap-4"
                  >
                    {/* Imagen y Detalles del Producto */}
                    <div className="flex items-center space-x-3 flex-grow">
                      <div className="w-14 h-14 bg-gradient-to-b from-amber-50/20 to-transparent rounded-lg flex items-center justify-center overflow-hidden border border-gray-50 flex-shrink-0">
                        <img
                          src={item.producto.imagenes_url?.[0] ?? ""}
                          alt={item.producto.nombre}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h2 className="text-sm font-extrabold text-[#1E1E24] leading-tight">{item.producto.nombre}</h2>
                        <span className="text-xs font-bold text-[#E63946] block mt-0.5">${item.producto.precio.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-3 flex-shrink-0">

                      {/* Personalizar */}
                      <button
                        onClick={() => personalizarProducto(item.producto.nombre)}
                        className="px-2.5 py-1.5 text-[10px] font-bold text-gray-500 bg-gray-50 hover:bg-amber-100 hover:text-[#1E1E24] rounded-md transition-colors border border-gray-100 cursor-pointer"
                      >
                        Personalizar
                      </button>

                      {/* Control de cantidad */}
                      <div className="flex items-center bg-gray-50 rounded-md border border-gray-100 overflow-hidden h-7">
                        <button
                          onClick={() => decrementar(item.id)}
                          className="px-2 text-xs font-bold text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer h-full"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-black text-[#1E1E24] select-none min-w-[20px] text-center">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => incrementar(item.id)}
                          disabled={sinStock.has(item.id)}
                          className="px-2 text-xs font-bold text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer h-full disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      {/* Eliminar */}
                      <button
                        onClick={() => eliminar(item.id)}
                        title="Eliminar del carrito"
                        className="p-1.5 text-gray-400 hover:text-[#E63946] hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* ── LADO DERECHO: RESUMEN DEL PEDIDO ── */}
          <div className="w-full lg:w-1/3">
            <h2 className="text-xl font-extrabold text-[#1E1E24] tracking-tight mb-2 opacity-0 lg:opacity-100 pointer-events-none">
              Resumen
            </h2>

            <div className="bg-white rounded-xl border border-gray-100/60 shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-[#1E1E24] border-b border-gray-50 pb-2">
                Resumen del Pedido
              </h3>

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
                  <span className="text-[#1E1E24] font-bold">
                    {costoEnvio === 0 ? 'Gratis' : `$${costoEnvio.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Dirección de entrega */}
              <div className="pt-3 border-t border-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Dirección de Entrega
                  </label>
                  <button
                    onClick={() => window.location.href = '/direcciones'}
                    className="text-[10px] font-bold text-[#E63946] hover:text-[#1E1E24] transition-colors focus:outline-none cursor-pointer flex items-center space-x-0.5"
                    title="Agregar nueva dirección"
                  >
                    <span>+ Nueva</span>
                  </button>
                </div>
                <div className="w-full">
                  <select
                    value={direccionId}
                    onChange={e => setDireccionId(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] transition-colors font-medium cursor-pointer"
                  >
                    <option value="" disabled hidden>Selecciona dónde entregamos...</option>
                    {direcciones.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.alias} — {d.calle1} {d.altura}, {d.ciudad}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Método de pago */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Método de Pago
                </label>
                <div className="w-full">
                  <select
                    value={formaPago}
                    onChange={e => setFormaPago(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] transition-colors font-medium cursor-pointer"
                  >
                    <option value="" disabled hidden>Selecciona cómo pagar...</option>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="MERCADOPAGO">Mercado Pago</option>
                  </select>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-end pt-3 border-t border-gray-50">
                <span className="text-xs font-bold text-[#1E1E24] uppercase tracking-wider">Total</span>
                <span className="text-xl font-black text-[#1E1E24]">${total.toFixed(2)}</span>
              </div>

              {itemsCarrito.some(item => sinStock.has(item.id)) && (
                <p className="text-[10px] text-red-500 font-bold text-center">
                  ⚠️ Algunos productos se agotaron
                </p>
              )}
              <button
                onClick={irAPagar}
                disabled={botonDeshabilitado}
                className="w-full bg-[#E63946] hover:bg-opacity-95 disabled:bg-gray-200 text-white font-extrabold text-xs py-2.5 px-4 rounded-lg tracking-wider uppercase transition-all shadow-xs active:scale-98 focus:outline-none cursor-pointer disabled:cursor-not-allowed text-center"
              >
                {cargando ? 'Procesando...' : 'Ir a Pagar'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
