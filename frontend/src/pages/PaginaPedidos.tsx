import { useEffect, useState } from 'react';
import BarraNavegacion from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { BsCalendarDate, BsClock, BsDot } from 'react-icons/bs';
import { useAuthUser } from '../context/AuthContext';
import { Pedido } from '../models/Pedido';
import { useWebSocket } from '../context/WebSocketContext';

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Confirmado',
  CONFIRMADO: 'Confirmado',
  EN_PREP: 'En preparación',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

export default function PaginaPedidos() {
    const navigate = useNavigate()
    const { user } = useAuthUser();
    const { lastEvent } =  useWebSocket()
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [pestañaActiva, setPestañaActiva] = useState<'proceso' | 'completado'>('proceso');

    const cargarPedidos = async () => {
      const res = await fetch('http://localhost:8000/pedidos/usuario', { credentials: 'include' });
      if (res.ok) setPedidos(await res.json());
    };

    useEffect(()=>{
      if(lastEvent?.event_type=="pedido_estado_actualizado"){
        cargarPedidos()
      }
      else return
    }, [lastEvent])

    useEffect(() => {
      if (user) cargarPedidos();
    }, [user]);

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

        {/* --- PESTAÑAS: EN PROCESO / COMPLETADOS (80% ancho) --- */}
        <div className="w-4/5 mx-auto mb-6 border-b border-gray-100 flex items-center justify-between select-none">
          <div className="flex space-x-6 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setPestañaActiva('proceso')}
              className={`pb-2.5 transition-all relative cursor-pointer focus:outline-none ${
                pestañaActiva === 'proceso'
                  ? 'text-[#E63946] font-black'
                  : 'text-gray-400 hover:text-[#1E1E24]'
              }`}
            >
              <span>En proceso</span>
              {pestañaActiva === 'proceso' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E63946] rounded-full animate-fadeIn" />
              )}
            </button>

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
        </div>

        {/* --- LISTADO DE TARJETAS HORIZONTALES (80% ancho) --- */}
        <div className="w-[85%] mx-auto space-y-3">
        {pedidos
          .filter((pedido) => {
            if (pestañaActiva === 'proceso') {
              return ['PENDIENTE', 'CONFIRMADO', 'EN_PREP', 'EN_CAMINO'].includes(pedido.estado_codigo);
            } else {
              return ['ENTREGADO', 'CANCELADO'].includes(pedido.estado_codigo);
            }
          })
          .map((pedido) => {
            const estadoLabel = ESTADO_LABEL[pedido.estado_codigo] ?? pedido.estado_codigo;
            const { fecha, hora } = formatFecha(pedido.created_at);
            const descripcionProductos = pedido.detalles.map(d => `${d.cantidad}x ${d.nombre}`).join(', ');
            const cantidadProductos = pedido.detalles.reduce((a, d) => a + d.cantidad, 0);
            const puedecancelar = ['PENDIENTE', 'CONFIRMADO'].includes(pedido.estado_codigo);
            const estaCompletado = pedido.estado_codigo === 'ENTREGADO' || pedido.estado_codigo === 'CANCELADO';

            return (
              <article
              key={pedido.id}
              className="bg-white rounded-xl border border-gray-100/70 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 transition-all duration-300 hover:shadow-md"
              >
              <div className="space-y-2 flex-grow min-w-0">

                  <h2 className="text-s font-black text-stone-700 tracking-tight">
                      Pedido #{pedido.id}
                  </h2>

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

                  <p className="text-sm text-gray-600 font-normal leading-relaxed line-clamp-1 pr-4">
                  {descripcionProductos}
                  </p>

                  <div className="flex flex-wrap gap-x-4 text-xs font-bold text-[#1E1E24] pt-0.4">
                  <p>Total artículos: <span className="text-gray-500 font-semibold">{cantidadProductos}</span></p>
                  <p>Precio total: <span className="text-[#E63946] font-black">${Number(pedido.total).toFixed(2)}</span></p>
                  </div>

              </div>

              <div className="flex-shrink-0 flex flex-col items-end space-y-2 sm:min-w-[120px]">

                  <div className="flex justify-end w-full pb-0.4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${obtenerEstilosEstado(estadoLabel)}`}>
                      {estadoLabel}
                  </span>
                  </div>

                  <div className="w-full flex flex-col space-y-1">
                  <button
                      onClick={() => navigate(`/pedidos/${pedido.id}`)}
                      className="w-full border border-stone-900 hover:bg-amber-300 hover:border-amber-300 text-stone-700 font-bold text-[11px] py-1.5 px-3 rounded-lg transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer text-center whitespace-nowrap"
                  >
                      Ver detalles
                  </button>

                  {puedecancelar && !estaCompletado && (
                    <button
                      onClick={() => cancelarPedido(pedido.id)}
                      className="w-full border border-red-400 hover:bg-red-400 text-stone-700 font-bold text-[11px] py-1.5 px-3 rounded-lg transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer text-center whitespace-nowrap"
                      >
                      Cancelar Pedido
                      </button>
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