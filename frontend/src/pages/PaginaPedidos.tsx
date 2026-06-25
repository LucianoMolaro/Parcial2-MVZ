import { useState } from 'react';
import BarraNavegacion from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { filtrosItems } from '../models/OpcionesItems';

interface Pedido {
  id: number;
  estado: 'Confirmado' | 'En preparación' | 'En camino' | 'Entregado';
  fecha: string;
  hora: string;
  descripcionProductos: string;
  cantidadProductos: number;
}

// Datos Mock con diferentes estados para previsualizar la interfaz
const PEDIDOS_MOCK: Pedido[] = [
  {
    id: 5,
    estado: 'En preparación',
    fecha: '23 Jun 2026',
    hora: '20:15',
    descripcionProductos: '2x Mega Burger Triple Queso (Sin Cebolla caramelizada), 1x Papas Cheddar & Bacon, 1x Coca-Cola Original Mediana',
    cantidadProductos: 4,
  },
  {
    id: 4,
    estado: 'En camino',
    fecha: '23 Jun 2026',
    hora: '19:30',
    descripcionProductos: '1x Pizza Pepperoni Suprema, 1x Combo Tequeños Auténticos (8 piezas), 1x Sprite Zero',
    cantidadProductos: 3,
  },
  {
    id: 3,
    estado: 'Entregado',
    fecha: '21 Jun 2026',
    hora: '14:20',
    descripcionProductos: '3x Crispy Chicken Tenders, 2x Porción de Papas Fritas Rústicas, 2x Salsa BBQ Extra',
    cantidadProductos: 7,
  },
  {
    id: 2,
    estado: 'Confirmado',
    fecha: '18 Jun 2026',
    hora: '21:05',
    descripcionProductos: '1x Mega Burger Triple Queso, 1x Papas Cheddar & Bacon',
    cantidadProductos: 2,
  }
];

export default function PaginaPedidos() {
    const navigate = useNavigate()
    const [pedidos] = useState<Pedido[]>(PEDIDOS_MOCK);
    const esAdmin=false
    const puedecancelar=true 
    const aceptado=true
    const [categoriaActiva, setCategoriaActiva] = useState('todos');
    const [filtroOpciones, setFiltroOpciones] = useState<filtrosItems[]>([])
    const [criterioSeleccionado, setCriterioSeleccionado] = useState("");

  // Función sutil para asignar el color de la etiqueta según el estado
  const obtenerEstilosEstado = (estado: Pedido['estado']) => {
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

  const verDetallesPedido = (id: number) => {
    console.log(`Abriendo detalles del Pedido #${id}`);
    // Aquí puedes redirigir con navigate(`/pedidos/${id}`) o abrir un modal informativo
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

                {/* --- CONTENEDOR DE BÚSQUEDA Y ORDENAMIENTO (80% de ancho, centrado y sutil) --- */}
        <div className="w-4/5 mx-auto mb-6 px-1 flex flex-col sm:flex-row gap-3 items-center">
          
          {/* Sub-contenedor Grid para buscador y selectores (Mantiene tu estructura de mitad y mitad) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center flex-grow w-full">
            
            {/* Lado Izquierdo: Input de Búsqueda */}
            <div className="w-full relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 select-none pointer-events-none">
                <svg xmlns="http://w3.org" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Busca tu antojo favorito..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-100/80 rounded-xl shadow-xs text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium"
              />
            </div>

            {/* Lado Derecho: Filtros de Criterio y sus Opciones de Divisiones */}
            <div className="grid grid-cols-2 gap-3 w-full">
              
              {/* 1. Selector de Criterio Principal */}
              <div>
                <select
                  className="w-full px-2 py-2 text-xs bg-white border border-gray-100/80 rounded-xl shadow-xs text-[#1E1E24] focus:outline-none focus:border-[#FFB703] transition-colors font-medium cursor-pointer"
                  value={criterioSeleccionado}
                  onChange={(e) => setCriterioSeleccionado(e.target.value)}
                >
                  <option value="" disabled hidden>Filtrar por...</option>
                  <option value="todos">Todos los productos</option>
                  
                  {filtroOpciones.map((filtro) => (
                    <option key={filtro.nombre} value={filtro.nombre}>
                      {filtro.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Selector de Divisiones Dinámicas */}
              <div>
                <select
                  className="w-full px-2 py-2 text-xs bg-white border border-gray-100/80 rounded-xl shadow-xs text-[#1E1E24] focus:outline-none focus:border-[#FFB703] transition-colors font-medium cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  defaultValue=""
                  // Deshabilitamos el selector si no se ha elegido un criterio válido o si eligen "todos"
                  disabled={!criterioSeleccionado || criterioSeleccionado === "todos"}
                >
                  <option value="" disabled hidden>Seleccionar opción...</option>
                  
                  {/* Buscamos el filtro activo en la lista y mapeamos sus divisiones */}
                  {filtroOpciones
                    .find((filtro) => filtro.nombre === criterioSeleccionado)
                    ?.divisiones.map((division) => (
                      <option key={division} value={division.toLowerCase()}>
                        {division}
                      </option>
                    ))}
                </select>
              </div>

            </div>
            </div>

            {/* --- BOTÓN SUTIL PARA ELIMINAR FILTROS ("X") --- */}
            {/* Se alinea perfectamente al final de los filtros en computadora y abajo en móvil */}
            <div className="w-full sm:w-auto flex justify-end">
              <button 
                title="Limpiar todos los filtros"
                className="w-full sm:w-9 h-8 flex items-center justify-center text-xs bg-white hover:bg-[#E63946] border border-gray-100/80 text-gray-400 hover:text-white rounded-xl shadow-xs focus:outline-none focus:border-[#E63946] transition-all font-black cursor-pointer active:scale-95"
              >
                <svg xmlns="http://w3.org" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

        </div>

            {/* --- LISTADO DE TARJETAS HORIZONTALES (80% ancho) --- */}
            <div className="w-4/5 mx-auto space-y-3">
            {pedidos.map((pedido) => (
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
                        <span>Cliente: <span className="text-[#1E1E24] font-medium">Juan Pérez (ID: 1514)</span></span>
                        </div>
                    )}
                    </div>

                    {/* 1. Cuándo se creó (Día y hora) */}
                    <p className="text-sm text-gray-700 font-medium flex items-center space-x-1">
                    <span>📅 {pedido.fecha}</span>
                    <span className="text-gray-400">•</span>
                    <span>⏰ {pedido.hora} hs</span>
                    </p>

                    {/* 2. Descripción de productos con line-clamp-1 */}
                    <p className="text-sm text-gray-600 font-normal leading-relaxed line-clamp-1 pr-4">
                    {pedido.descripcionProductos}
                    </p>

                    {/* 3. Fila de resumen de cantidades y precios en una sola línea horizontal */}
                    <div className="flex flex-wrap gap-x-4 text-xs font-bold text-[#1E1E24] pt-0.4">
                    <p>Total artículos: <span className="text-gray-500 font-semibold">{pedido.cantidadProductos}</span></p>
                    <p>Precio total: <span className="text-[#E63946] font-black">$50.00</span></p>
                    </div>

                </div>

                {/* LADO DERECHO: Estado posicionado ARRIBA y botones abajo */}
                <div className="flex-shrink-0 flex flex-col items-end space-y-2 sm:min-w-[50px]">
                    
                    {/* ✅ ESTADO MOVIDO: Ahora se ubica arriba a la derecha de forma sutil */}
                    <div className="flex justify-end w-full pb-0.4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${obtenerEstilosEstado(pedido.estado)}`}>
                        {pedido.estado}
                    </span>
                    </div>

                    {/* Contenedor de Botones de Acción (Se apilan verticalmente) */}
                    <div className="w-full flex flex-col space-y-1">
                    {/* Botón universal */}
                    <button
                        onClick={() => navigate(`/pedidos/${pedido.id}`)}
                        className="w-full border border-stone-900 hover:bg-amber-300 hover:border-amber-300 text-stone-700 font-bold  text-[10px] py-1.5 px-3 rounded-lg transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer text-center whitespace-nowrap"
                    >
                        Ver detalles
                    </button>

                    {/* Acciones exclusivas del Administrador */}
                    {esAdmin && (
                        <>
                            {aceptado ?(
                            <button
                                onClick={() => console.log(`Avanzar estado del pedido #${pedido.id}`)}
                                className="w-full border border-stone-900 hover:bg-opacity-90 text-stone-700 hover:bg-sky-400 hover:border-sky-400 font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer text-center whitespace-nowrap"
                            >
                                Avanzar Estado
                            </button>
                            ) : (
                            <button
                                onClick={() => console.log(`Aceptar pedido #${pedido.id}`)}
                                className="w-full border text-stone-700 border-stone-900 hover:bg-green-400 hover:border-green-400 font-bold text-xs py-1.5 px-3 rounded-lg transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer text-center whitespace-nowrap"
                            >
                                Aceptar Pedido
                            </button>
                            )}
                        </>
                    )}

                    {(puedecancelar || esAdmin) && (
                        <button
                        onClick={() => console.log(`Cancelar pedido #${pedido.id}`)}
                        className="w-full border border-red-400 hover:bg-red-400 text-stone-700 font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer text-center whitespace-nowrap"
                        >
                        Cancelar Pedido
                        </button>
                    )}
                    </div>
                </div>
            </article>
          ))}
        </div>

      </div>
    </>
  );
}