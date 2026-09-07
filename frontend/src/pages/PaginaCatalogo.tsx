import { useRef, useState, useEffect } from 'react';
import BarraNavegacion from '../components/Navbar';
import { useAuthUser } from '../context/AuthContext';
import { BsCurrencyDollar, BsCartPlus, BsBackspace, BsInfoSquare, BsChevronRight, BsChevronLeft } from 'react-icons/bs';
import { useFiltros } from '../context/FiltrosContext';

import { useCarrito } from '../context/CarritoContext';
import { Producto } from '../models/Producto';
import {  CategoriaFiltro } from '../models/Categoria';
import { useWebSocket } from '../context/WebSocketContext';




export default function PaginaCatalogo() {
  const { user } = useAuthUser();
  const { state, dispatch, limpiarFiltros } = useFiltros();
  const { agregar, cantidadDeItem } = useCarrito();
  const { lastEvent } = useWebSocket()

  useEffect(() => {
  if (window.location.hostname.includes('devtunnels.ms') || location.pathname!="/") {
    window.location.href = 'http://localhost:5173';
  }
}, []);
  
  const {
    nivelActualId,
    categoriaFiltradaId,
    criterioSeleccionado,
    divisionSeleccionada,
    busqueda,
    pagina,
    filtroOpciones,
  } = state;

    useEffect(()=>{
      fetch('http://localhost:8000/productos/', { credentials: 'include' })
      .then(r => r.json())
      .then(setProductos)
      .catch(() => {});
  }, [lastEvent])
  
  const esAdmin = user?.roles?.some(r => r.codigo === 'ADMIN' || r.codigo === 'PEDIDOS') ?? false;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriasBackend, setCategoriasBackend] = useState<CategoriaFiltro[]>([]);
  const [sinStock, setSinStock] = useState<Set<number>>(new Set());




  useEffect(() => {
    fetch('http://localhost:8000/productos/', { credentials: 'include' })
      .then(r => r.json())
      .then(setProductos)
      .catch(() => {});
  }, [pagina]);

  useEffect(() => {
    fetch('http://localhost:8000/categorias/catalogo')
      .then(r => r.json())
      .then((data: { id: number; nombre: string; parent_id: number | null }[]) => {
        setCategoriasBackend(data.map(c => ({
          id: String(c.id),
          nombre: c.nombre,
          emoji: '',
          padreId: c.parent_id ? String(c.parent_id) : null,
        })));
      })
      .catch(() => {});
  }, []);

  const categoriasParaCarrusel = categoriasBackend;

  const productosFiltrados = productos.filter(p =>
    !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const PER_PAGE = 8;
  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / PER_PAGE));
  const productosPagina = productosFiltrados.slice((pagina - 1) * PER_PAGE, pagina * PER_PAGE);

  // Categorías visibles en el carrusel según el nivel actual
  const categoriasVisiblesEnCarrusel = categoriasParaCarrusel.filter(
    (cat) => cat.padreId === nivelActualId
  );
  
  // ── Refs del DOM (puramente visuales, no son estado de negocio) ──
  const carruselRef   = useRef<HTMLDivElement>(null);
  const paginacionRef = useRef<HTMLDivElement>(null);
  
  const desplazarCarrusel = (direccion: "izquierda" | "derecha") => {
    carruselRef.current?.scrollBy({
      left: direccion === "izquierda" ? -176 : 176,
      behavior: "smooth",
    });
  };
  
  const moverPaginacion = (direccion: "izquierda" | "derecha") => {
    paginacionRef.current?.scrollBy({
      left: direccion === "izquierda" ? -72 : 72,
      behavior: "smooth",
    });
  };
  
  const handleAgregarAlCarrito = (producto: Producto) => {
    agregar(producto.id);
  };

  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-4 px-4 sm:px-6 lg:px-8">

        {/* ── CARRUSEL DE CATEGORÍAS ── */}
        <div className="w-4/5 mx-auto flex items-center justify-center gap-2 mt-2 mb-4 relative group/carrusel">

          <button
            onClick={() => desplazarCarrusel('izquierda')}
            className="hidden md:flex flex-shrink-0 w-8 h-8 items-center justify-center bg-white hover:bg-[#E63946] border border-gray-100 text-gray-400 hover:text-white rounded-full shadow-xs transition-all cursor-pointer active:scale-90"
            title="Anterior"
          >
            <BsChevronLeft></BsChevronLeft>
          </button>

          <div
            ref={carruselRef}
            className="max-w-[712px] w-full flex items-center justify-start gap-2 overflow-x-auto scrollbar-hide py-2 px-3 mx-auto scroll-smooth"
          >
            {/* 1. Botón Volver */}
            {nivelActualId !== null && (
              <button
                onClick={() => {
                  const categoriaActual = categoriasParaCarrusel.find((c) => c.id === nivelActualId);
                  dispatch({
                    type: "VOLVER_NIVEL",
                    payload: { nuevoPadreId: categoriaActual?.padreId ?? null },
                  });
                }}
                className="flex-shrink-0 rounded-xl p-3 flex flex-col justify-center items-center h-20 w-20 bg-gray-100 hover:bg-gray-200 text-[#1E1E24] transition-all cursor-pointer font-bold text-xs shadow-xs"
              >
                <div className="flex items-center gap-1">
                  <BsBackspace className="w-3.5 h-3.5" />
                  <span>Volver</span>
                </div>
              </button>
            )}

            {/* 2. Tarjeta del padre actual (ej: "Burgers" dentro del nivel Burgers) */}
            {nivelActualId !== null && (() => {
              const catPadre = categoriasParaCarrusel.find((c) => c.id === nivelActualId);
              if (!catPadre) return null;
              const esPadreActivo = categoriaFiltradaId === catPadre.id;

              return (
                <div
                  onClick={() =>
                    dispatch({ type: "FILTRAR_PADRE_ACTUAL", payload: { padreId: catPadre.id } })
                  }
                  className={`flex-shrink-0 rounded-xl p-3 flex flex-col justify-between h-20 w-20 relative overflow-hidden group cursor-pointer shadow-xs transition-all duration-300 select-none ${
                    esPadreActivo
                      ? 'bg-red-500 text-white ring-4 ring-[#E63946]/10 scale-105 z-10'
                      : 'bg-amber-300 text-[#1E1E24] hover:shadow-md hover:scale-102'
                  }`}
                >
                  <h3 className={`font-black text-xs z-10 tracking-tight leading-tight ${esPadreActivo ? 'text-white' : 'text-[#1E1E24]'}`}>
                    {catPadre.nombre}
                  </h3>
                  <div className="absolute bottom-1 right-1 w-12 h-12 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl opacity-80">{catPadre.emoji}</span>
                  </div>
                </div>
              );
            })()}

            {/* 3. Botón "Todos" (solo en la raíz) */}
            {nivelActualId === null && (
              <div
                onClick={() => dispatch({ type: "LIMPIAR" })}
                className={`flex-shrink-0 rounded-xl p-3 flex flex-col justify-between h-20 w-20 relative overflow-hidden group cursor-pointer shadow-xs transition-all duration-300 select-none ${
                  categoriaFiltradaId === 'todos'
                    ? 'bg-red-500 text-white ring-4 ring-[#E63946]/10 scale-105 z-10'
                    : 'bg-amber-300 text-[#1E1E24]'
                }`}
              >
                <h3 className="font-black text-xs z-10 tracking-tight leading-tight">Todos</h3>
                <div className="absolute bottom-1 right-1 w-12 h-12 flex items-center justify-center text-2xl opacity-80">🍽️</div>
              </div>
            )}

            {/* 4. Subcategorías del nivel actual */}
            {categoriasVisiblesEnCarrusel.map((cat) => {
              const esActivo   = categoriaFiltradaId === cat.id;
              const tieneHijos = categoriasParaCarrusel.some((c) => c.padreId === cat.id);

              return (
                <div
                  key={cat.id}
                  onClick={() =>
                    dispatch(
                      tieneHijos
                        ? { type: "FILTRAR_CATEGORIA_CON_HIJOS", payload: { categoriaId: cat.id } }
                        : { type: "FILTRAR_CATEGORIA_HOJA",      payload: { categoriaId: cat.id } }
                    )
                  }
                  // Mantenemos tu estructura e interactividad
                  className={`flex-shrink-0 rounded-xl flex flex-col justify-end h-20 w-20 relative overflow-hidden group cursor-pointer shadow-xs transition-all duration-300 select-none ${
                    esActivo
                      ? 'bg-red-500 text-white ring-4 ring-[#E63946]/10 scale-105 z-10'
                      : 'bg-amber-300 text-[#1E1E24] hover:shadow-md hover:scale-102'
                  }`}
                >
                  {/* --- 1. EMOJI / IMAGEN DE FONDO --- */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden bg-white/10 flex items-center justify-center">
                    <span className="text-3xl opacity-70 transform group-hover:scale-110 transition-transform duration-300 select-none">
                      {cat.emoji || '🍽️'}
                    </span>

                    {/* Capa de degradado corregida: Empieza transparente arriba y se funde abajo */}
                    <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-95% ${
                      esActivo ? 'to-red-500' : 'to-amber-300'
                    }`} />
                  </div>

                  {/* --- 2. TEXTO FLOTANTE: Ocupa la mitad inferior y está centrado verticalmente --- */}
                  {/* Eliminamos el fondo de este div para matar el bug de la línea divisoria */}
                  <div className="h-1/2 w-full flex items-center justify-center p-1 text-center z-10">
                    <h3 className={`font-black text-[10px] tracking-tight leading-none ${esActivo ? 'text-white' : 'text-[#1E1E24]'}`}>
                      {cat.nombre}
                    </h3>
                  </div>

                </div>
              );
            })}
          </div>

          <button
            onClick={() => desplazarCarrusel('derecha')}
            className="hidden md:flex flex-shrink-0 w-8 h-8 items-center justify-center bg-white hover:bg-[#E63946] border border-gray-100 text-gray-400 hover:text-white rounded-full shadow-xs transition-all cursor-pointer active:scale-90"
            title="Siguiente"
          >
            <BsChevronRight></BsChevronRight>
          </button>
        </div>


        {/* ── GRID DE PRODUCTOS ── */}
        <div className="w-[90%] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {productosPagina.map((producto) => (
            <article
              key={producto.id}
              className="bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md border border-gray-100/60 transition-all duration-300 flex flex-col group"
            >
              <div className="relative bg-gradient-to-b from-amber-50/20 to-transparent pt-3 px-3 flex items-center justify-center h-28 overflow-hidden">
                <div className="absolute top-1.5 left-1.5 flex flex-row gap-1 z-10">
                </div>
                <img
                  src={producto.imagenes_url?.[0] ?? ""}
                  alt={producto.nombre}
                  className="h-full w-auto object-contain drop-shadow-xs transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-3 flex flex-col flex-grow justify-between space-y-2">
                <div className="space-y-1">
                  <h2 className="text-sm font-extrabold text-[#1E1E24] group-hover:text-[#E63946] transition-colors leading-tight line-clamp-2">
                    {producto.nombre}
                  </h2>
                  <div className='flex flex-col-2 items-center'>
                    <p className="text-[11px] w-4/5 text-gray-400 font-normal line-clamp-2 leading-relaxed">
                      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aliquam ratione nam accusantium error libero, dignissimos voluptatem nobis. Consequatur magni totam eligendi quibusdam quod veniam! Sapiente possimus veritatis natus iusto placeat!
                    </p>
                    <button 
                      title='Mostrar detalles'
                      className="w-auto text-stone-700 font-normal line-clamp-2 leading-relaxed flex items-center justify-end mx-auto drop-shadow-xs transform hover:scale-105 transition-transform duration-300">
                      <BsInfoSquare className='w-5 h-5'></BsInfoSquare>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-gray-50">
                    <>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Precio</span>
                        <div className="flex items-center">
                          <BsCurrencyDollar />
                          <span className="text-sm font-extrabold text-[#1E1E24]">
                            {producto.precio.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAgregarAlCarrito(producto)}
                        disabled={producto.stock_cantidad === 0 || sinStock.has(producto.id)}
                        className="bg-amber-300 hover:bg-[#E63946] text-[#1E1E24] hover:text-white font-bold text-[11px] px-2.5 py-1.5 rounded-md flex items-center space-x-1 transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer disabled:bg-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
                      >
                        <BsCartPlus className="w-3.5 h-3.5" />
                        <span>Agregar</span>
                      </button>
                    </>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ── PAGINACIÓN ── */}
        <div className="w-max mx-auto mt-10 flex items-center justify-center gap-2 select-none">
          <button
            onClick={() => moverPaginacion('izquierda')}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-white hover:bg-[#E63946] border border-gray-100/80 text-gray-400 hover:text-white rounded-lg shadow-xs transition-all cursor-pointer active:scale-90 focus:outline-none"
            title="Página Anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref={paginacionRef}
            className="max-w-[252px] w-full flex items-center justify-start gap-2 overflow-x-auto scrollbar-hide py-2 px-2.5 mx-auto scroll-smooth"
          >
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numeroPagina) => (
              <button
                key={numeroPagina}
                onClick={() => dispatch({ type: "SET_PAGINA", payload: numeroPagina })}
                className={`flex-shrink-0 w-7 h-7 flex items-center justify-center text-xs font-black rounded-lg transition-all duration-200 shadow-xs focus:outline-none cursor-pointer ${
                  pagina === numeroPagina
                    ? 'bg-[#E63946] text-white ring-2 ring-[#E63946]/10 scale-105 z-10'
                    : 'bg-white text-[#1E1E24] hover:bg-[#FFB703] hover:text-[#1E1E24] border border-gray-100/80'
                }`}
              >
                {numeroPagina}
              </button>
            ))}
          </div>

          <button
            onClick={() => moverPaginacion('derecha')}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-white hover:bg-[#E63946] border border-gray-100/80 text-gray-400 hover:text-white rounded-lg shadow-xs transition-all cursor-pointer active:scale-90 focus:outline-none"
            title="Página Siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {productosFiltrados.length === 0 && (
          <div className="text-center py-12 text-sm font-medium text-gray-400">
            No hay productos disponibles en esta categoría por el momento.
          </div>
        )}

      </div>
    </>
  );
}