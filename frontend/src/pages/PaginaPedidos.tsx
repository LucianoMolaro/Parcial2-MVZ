import { useEffect, useState } from 'react';
import BarraNavegacion from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { filtrosItems } from '../models/OpcionesItems';
import { BsCalendarDate, BsClock, BsDot } from 'react-icons/bs';
import { useAuthUser } from '../context/AuthContext';
import { useWsEvent } from '../context/WebSocketContext';
import { WsEvent } from '../models/WebSockets';

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Confirmado',
  CONFIRMADO: 'Confirmado',
  EN_PREP: 'En preparación',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

const SIGUIENTE: Record<string, string> = {
  PENDIENTE: 'CONFIRMADO',
  CONFIRMADO: 'EN_PREP',
  EN_PREP: 'EN_CAMINO',
  EN_CAMINO: 'ENTREGADO',
};

interface DetallePedido {
  nombre: string;
  cantidad: number;
}

interface Pedido {
  id: number;
  estado_codigo: string;
  created_at: string | null;
  total: string;
  detalles: DetallePedido[];
  usuario_id: number;
}

export default function PaginaPedidos() {
    const navigate = useNavigate()
    const { user } = useAuthUser();
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [filtroOpciones, setFiltroOpciones] = useState<filtrosItems[]>([])
    const [criterioSeleccionado, setCriterioSeleccionado] = useState("");
    const [pestañaActiva, setPestañaActiva] = useState<'proceso' | 'completado'>('proceso');

    const esAdmin = user?.roles?.some(r => r.codigo === 'ADMIN' || r.codigo === 'PEDIDOS') ?? false;

    const cargarPedidos = async () => {
      const res = await fetch('http://localhost:8000/pedidos/', { credentials: 'include' });
      if (res.ok) setPedidos(await res.json());
    };

    useEffect(() => { cargarPedidos(); }, []);

    useWsEvent('pedido_estado_actualizado', (evt: WsEvent) => {
      const d = evt.data as { pedido_id: number; estado_codigo: string };
      setPedidos(prev => prev.map(p => p.id === d.pedido_id ? { ...p, estado_codigo: d.estado_codigo } : p));
    });

    useWsEvent('nuevo_pedido', () => {
      if (esAdmin) cargarPedidos();
    });

    const avanzarEstado = async (pedidoId: number, estadoCodigo: string) => {
      const siguiente = SIGUIENTE[estadoCodigo];
      if (!siguiente) return;
      await fetch(`http://localhost:8000/pedidos/${pedidoId}/estado`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado_pedido_codigo: siguiente }),
      });
    };

    const cancelarPedido = async (pedidoId: number) => {
      if (!confirm('¿Cancelar este pedido?')) return;
      await fetch(`http://localhost:8000/pedidos/${pedidoId}/estado`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado_pedido_codigo: 'CANCELADO' }),
      });
    };

  const obtenerEstilosEstado = (estado: string) => {
    switch (estado) {
      case 'Confirmado':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'En preparación':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'En camino':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Entregado':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const formatFecha = (iso: string | null) => {
    if (!iso) return { fecha: '-', hora: '-' };
    const d = new Date(iso);
    return {
      fecha: d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }),
      hora: d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-4 px-4 sm:px-6 lg:px-8">

        {/* --- ENCABEZADO DE LA SECCIÓN (80% ancho) --- */}
        <div className="w-4/5 mx-auto mb-4">
          <h1 className="text-xl font-extrabold text-[#1E1E24] tracking-tight sm:text-2xl">
            <span className="text-[#E63946]">Pedidos</span>
          </h1>
        </div>

            {esAdmin && (<>
              {/* --- SECCIONAL DE FILTROS POR PESTAÑAS (80% ancho, centrado y sutil) --- */}
              <div className="w-4/5 mx-auto mb-6 border-b border-gray-100 flex items-center justify-between select-none">

                {/* Pestañas de Control */}
                <div className="flex space-x-6 text-xs font-bold uppercase tracking-wider">

                  {/* Pestaña: En Proceso */}
                  <button
                    onClick={() => setPestañaActiva('proceso')}
                    className={`pb-2.5 transition-all relative cursor-pointer focus:outline-none ${
                      pestañaActiva === 'proceso'
                        ? 'text-[#E63946] font-black'
                        : 'text-gray-400 hover:text-[#1E1E24]'
                    }`}
                  >
                    <span>En proceso</span>
                    {/* Línea roja indicadora inferior sutil */}
                    {pestañaActiva === 'proceso' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E63946] rounded-full animate-fadeIn" />
                    )}
                  </button>

                  {/* Pestaña: Completados */}
                  <button
                    onClick={() => setPestañaActiva('completado')}
                    className={`pb-2.5 transition-all relative cursor-pointer focus:outline-none ${
                      pestañaActiva === 'completado'
                        ? 'text-[#E63946] font-black'
                        : 'text-gray-400 hover:text-[#1E1E24]'
                    }`}
                  >
                    <span>Completados</span>
                    {pestañaActiva === 'completado' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E63946] rounded-full animate-fadeIn" />
                    )}
                  </button>
                </div>

                {/* Contador sutil de apoyo visual a la derecha (UX mejorada) */}
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100/50">
                  Filtro de Estado
                </span>

              </div>
            </>)}

            {/* --- LISTADO DE TARJETAS HORIZONTALES (80% ancho) --- */}
            <div className="w-[85%] mx-auto space-y-3">
            {pedidos.
            filter((pedido) => {
            if (pestañaActiva === 'proceso') {
              return ['PENDIENTE','CONFIRMADO','EN_PREP','EN_CAMINO'].includes(pedido.estado_codigo);
            } else {
              return ['ENTREGADO','CANCELADO'].includes(pedido.estado_codigo);
            }
            }).map((pedido) => {
              const estadoLabel = ESTADO_LABEL[pedido.estado_codigo] ?? pedido.estado_codigo;
              const { fecha, hora } = formatFecha(pedido.created_at);
              const descripcionProductos = pedido.detalles.map(d => `${d.cantidad}x ${d.nombre}`).join(', ');
              const cantidadProductos = pedido.detalles.reduce((a, d) => a + d.cantidad, 0);
              const aceptado = pedido.estado_codigo !== 'PENDIENTE';
              const puedecancelar = !esAdmin && ['PENDIENTE','CONFIRMADO'].includes(pedido.estado_codigo);
              const estaCompletado = pedido.estado_codigo === 'ENTREGADO' || pedido.estado_codigo === 'CANCELADO';

              return (
                <article
                key={pedido.id}
                className="bg-white rounded-xl border border-gray-100/70 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 transition-all duration-300 hover:shadow-md"
                >
                {/* LADO IZQUIERDO: Estructura vertical compactada (Mismos tamaños de fuente, menos paddings) */}
                <div className="space-y-2 flex-grow min-w-0">

                    {/* Fila superior: Título del pedido y datos de administración en una sola línea */}
                    <div className="flex flex-wrap items-baseline gap-x-3">
                    <h2 className="text-s font-black text-stone-700 tracking-tight">
                        Pedido #{pedido.id}
                    </h2>

                    {esAdmin && (
                        <div className="flex flex-wrap gap-x-2 text-xs font-bold text-[#E63946] tracking-tight">
                        <span>Cliente: <span className="text-[#1E1E24] font-medium">ID: {pedido.usuario_id}</span></span>
                        </div>
                    )}
                    </div>

                    {/* 1. Cuándo se creó (Día y hora) */}
                    <p className="text-sm text-gray-700 font-medium flex items-center space-x-1">
                    <div className='flex items-center gap-1'>
                      <BsCalendarDate className='w-3.5 h-3.5'></BsCalendarDate>
                      <span>{fecha}</span>
                    </div>
                    <BsDot className='text-red-500'></BsDot>
                    <div className='flex items-center gap-1'>
                      <BsClock className='w-3.5 h-3.5'></BsClock>
                      <span>{hora}hs</span>
                    </div>
                    </p>

                    {/* 2. Descripción de productos con line-clamp-1 */}
                    <p className="text-sm text-gray-600 font-normal leading-relaxed line-clamp-1 pr-4">
                    {descripcionProductos}
                    </p>

                    {/* 3. Fila de resumen de cantidades y precios en una sola línea horizontal */}
                    <div className="flex flex-wrap gap-x-4 text-xs font-bold text-[#1E1E24] pt-0.4">
                    <p>Total artículos: <span className="text-gray-500 font-semibold">{cantidadProductos}</span></p>
                    <p>Precio total: <span className="text-[#E63946] font-black">${Number(pedido.total).toFixed(2)}</span></p>
                    </div>

                </div>

                {/* LADO DERECHO: Estado posicionado ARRIBA y botones abajo */}
                <div className="flex-shrink-0 flex flex-col items-end space-y-2 sm:min-w-[120px]">

                    {/* ✅ ESTADO MOVIDO: Ahora se ubica arriba a la derecha de forma sutil */}
                    <div className="flex justify-end w-full pb-0.4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${obtenerEstilosEstado(estadoLabel)}`}>
                        {estadoLabel}
                    </span>
                    </div>

                    {/* Contenedor de Botones de Acción (Se apilan verticalmente) */}
                    <div className="w-full flex flex-col space-y-1">
                    {/* Botón universal */}
                    <button
                        onClick={() => navigate(`/pedidos/${pedido.id}`)}
                        className="w-full border border-stone-900 hover:bg-amber-300 hover:border-amber-300 text-stone-700 font-bold text-[11px] py-1.5 px-3 rounded-lg transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer text-center whitespace-nowrap"
                    >
                        Ver detalles
                    </button>

                    {/* Acciones exclusivas del Administrador */}
                    {esAdmin && (
                        <>
                            {aceptado ? (
                              !estaCompletado && (
                                <button
                                  onClick={() => avanzarEstado(pedido.id, pedido.estado_codigo)}
                                  className="w-full border border-stone-900 hover:bg-opacity-90 text-stone-700 hover:bg-sky-400 hover:border-sky-400 font-bold text-[11px] py-1.5 px-3 rounded-lg transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer text-center whitespace-nowrap"
                                >
                                  Avanzar Estado
                                </button>
                              )
                            ) : (
                            <button
                                onClick={() => avanzarEstado(pedido.id, pedido.estado_codigo)}
                                className="w-full border text-stone-700 border-stone-900 hover:bg-green-400 hover:border-green-400 font-bold text-[11px] py-1.5 px-3 rounded-lg transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer text-center whitespace-nowrap"
                            >
                                Aceptar Pedido
                            </button>
                            )}
                        </>
                    )}

                    {(puedecancelar || esAdmin) && (
                      !estaCompletado && (
                      <button
                        onClick={() => cancelarPedido(pedido.id)}
                        className="w-full border border-red-400 hover:bg-red-400 text-stone-700 font-bold text-[11px] py-1.5 px-3 rounded-lg transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer text-center whitespace-nowrap"
                        >
                        Cancelar Pedido
                        </button>)
                      )}
                    </div>
                </div>
            </article>
          )})}
        </div>

      </div>
    </>
  );
}
