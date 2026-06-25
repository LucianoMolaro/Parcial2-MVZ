import React, { useEffect, useRef, useState } from 'react';
import BarraNavegacion from '../components/Navbar';
import { filtroitems, filtrosItems } from '../models/OpcionesItems';
import { useAuthUser } from '../context/AuthContext';

interface Producto {
  id: number;
  nombre: string;
  ingredientes: string;
  precio: number;
  imagen: string;
  categoria: string; // Añadido para hacer funcionar los filtros
  badge?: string;
}

interface CategoriaFiltro {
  id: string;
  nombre: string;
  emoji: string; // Usado temporalmente en lugar de src "" para que veas cómo se posiciona la imagen sutil
}

const CATEGORIAS_MOCK: CategoriaFiltro[] = [
  { id: 'todos', nombre: 'Todos', emoji: '🍽️' },
  { id: 'hamburguesas', nombre: 'Burgers', emoji: '🍔' },
  { id: 'pizzas', nombre: 'Pizzas', emoji: '🍕' },
  { id: 'snacks', nombre: 'Snacks', emoji: '🍟' },
  { id: 'combos', nombre: 'Combos', emoji: '📦' },
    { id: 'snacks', nombre: 'Snacks', emoji: '🍟' },
  { id: 'snacks', nombre: 'Snacks', emoji: '🍟' },
  { id: 'combos', nombre: 'Combos', emoji: '📦' },
    { id: 'snacks', nombre: 'Snacks', emoji: '🍟' },
  { id: 'combos', nombre: 'Combos', emoji: '📦' },
    { id: 'snacks', nombre: 'Snacks', emoji: '🍟' },
  { id: 'combos', nombre: 'Combos', emoji: '📦' },




];

const PRODUCTOS_MOCK: Producto[] = [
  { id: 1, nombre: "Mega Burger Triple Queso", ingredientes: "Triple carne de res, triple cheddar, tocino crujiente, cebolla caramelizada y salsa secreta.", precio: 8.99, imagen: "", categoria: "hamburguesas", badge: "Más Vendido" },
  { id: 2, nombre: "Pizza Pepperoni Suprema", ingredientes: "Masa artesanal, salsa de tomate premium, doble mozzarella, abundante pepperoni.", precio: 12.50, imagen: "", categoria: "pizzas", badge: "Popular" },
  { id: 3, nombre: "Crispy Chicken Tenders", ingredientes: "6 piezas de pechuga de pollo marinada, empanizado extra crujiente con salsa BBQ.", precio: 6.50, imagen: "", categoria: "snacks" },
  { id: 4, nombre: "Papas Cheddar & Bacon", ingredientes: "Porción grande de papas fritas rústicas bañadas en nuestra salsa de queso cheddar fundido.", precio: 4.99, imagen: "", categoria: "snacks", badge: "Nuevo" },
  { id: 5, nombre: "Burger BBQ Ahumada", ingredientes: "Carne a la parrilla, queso monterey jack, aros de cebolla apanados, lechuga y tomate.", precio: 9.25, imagen: "", categoria: "hamburguesas" },
  { id: 7, nombre: "Combo Tequeños Auténticos", ingredientes: "8 deditos de masa crujiente rellenos de abundante queso blanco derretido.", precio: 5.75, imagen: "", categoria: "combos" },
  { id: 8, nombre: "Combo Tequeños Auténticos", ingredientes: "8 deditos de masa crujiente rellenos de abundante queso blanco derretido.", precio: 5.75, imagen: "", categoria: "combos" },
  { id: 9, nombre: "Combo Tequeños Auténticos", ingredientes: "8 deditos de masa crujiente rellenos de abundante queso blanco derretido.", precio: 5.75, imagen: "", categoria: "combos" }
];

export default function PaginaProductos() {
  const { user } = useAuthUser()
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [filtroOpciones, setFiltroOpciones] = useState<filtrosItems[]>([])
  const [criterioSeleccionado, setCriterioSeleccionado] = useState("");
  const esAdmin = true

  const carruselRef = useRef<HTMLDivElement>(null);

  // Función para mover el carrusel suavemente con las flechas
  const desplazarCarrusel = (direccion: 'izquierda' | 'derecha') => {
    if (carruselRef.current) {
      const distancia = 176; // Desplaza aproximadamente dos tarjetas por clic (80px ancho + 8px gap) * 2
      carruselRef.current.scrollBy({
        left: direccion === 'izquierda' ? -distancia : distancia,
        behavior: 'smooth'
      });
    }
  };


  const paginacionRef = useRef<HTMLDivElement>(null);

  // Función para desplazar los números suavemente
  const moverPaginacion = (direccion: 'izquierda' | 'derecha') => {
    if (paginacionRef.current) {
      const distancia = 72; // Mueve aproximadamente dos números por clic (28px de ancho + 8px de gap) * 2
      paginacionRef.current.scrollBy({
        left: direccion === 'izquierda' ? -distancia : distancia,
        behavior: 'smooth'
      });
    }
  };

  useEffect(()=>{
        const roles = user?.roles.map(rol => rol.codigo) ?? ["GUEST"];
        const filtrosVisibles = filtroitems.filter(item => roles?.some(rol => item.roles.includes(rol)));
        setFiltroOpciones(filtrosVisibles)
      }, [user])


  const agregarAlCarrito = (id: number, nombre: string) => {
    console.log(`Producto agregado: ${nombre} (ID: ${id})`);
  };

  // Filtrado lógico de los productos en tiempo real
  const productosFiltrados = categoriaActiva === 'todos' 
    ? PRODUCTOS_MOCK 
    : PRODUCTOS_MOCK.filter(p => p.categoria === categoriaActiva);

  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8">
        
        {/* --- CONTENEDOR CONTROLES Y CARRUSEL (Ajustado sin p-5 invasivo) --- */}
        <div className="w-4/5 mx-auto flex items-center justify-center gap-2 mt-2 mb-4 relative group/carrusel">
          
          {/* Flecha Izquierda (Corregido el xmlns del SVG) */}
          <button 
            onClick={() => desplazarCarrusel('izquierda')}
            className="hidden md:flex flex-shrink-0 w-8 h-8 items-center justify-center bg-white hover:bg-[#E63946] border border-gray-100 text-gray-400 hover:text-white rounded-full shadow-xs transition-all cursor-pointer active:scale-90"
            title="Anterior"
          >
            <svg xmlns="http://w3.org" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* --- CONTENEDOR CON ANCHO MÁXIMO LIMITADO A 8 TARJETAS --- */}
          <div 
            ref={carruselRef}
            className="max-w-[712px] w-full flex items-center justify-start gap-2 overflow-x-auto scrollbar-hide py-3 px-4 mx-auto scroll-smooth"
          >
            {CATEGORIAS_MOCK.map((cat) => {
              const esActivo = categoriaActiva === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  className={`flex-shrink-0 rounded-xl p-3 flex flex-col justify-between h-20 w-20 relative overflow-hidden group cursor-pointer shadow-xs transition-all duration-300 select-none ${
                    esActivo 
                      ? 'bg-[#E63946] text-white ring-4 ring-[#E63946]/10 scale-105 z-10' 
                      : 'bg-[#FFB703] text-[#1E1E24] hover:shadow-md hover:scale-102'
                  }`}
                >
                  {/* Nombre de la categoría */}
                  <h3 className={`font-black text-xs z-10 tracking-tight leading-tight ${esActivo ? 'text-white' : 'text-[#1E1E24]'}`}>
                    {cat.nombre}
                  </h3>
                  
                  {/* Contenedor de Imagen Absoluta */}
                  <div className="absolute bottom-1 right-1 w-12 h-12 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl opacity-80 group-hover:opacity-100 transition-opacity">{cat.emoji}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flecha Derecha */}
          <button 
            onClick={() => desplazarCarrusel('derecha')}
            className="hidden md:flex flex-shrink-0 w-8 h-8 items-center justify-center bg-white hover:bg-[#E63946] border border-gray-100 text-gray-400 hover:text-white rounded-full shadow-xs transition-all cursor-pointer active:scale-90"
            title="Siguiente"
          >
            <svg xmlns="http://w3.org" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>

        </div>

        {/* --- CONTENEDOR DE BÚSQUEDA Y ORDENAMIENTO (80% de ancho, centrado y sutil) --- */}
        <div className="w-4/5 mx-auto mb-6 px-1 flex flex-col sm:flex-row gap-3 items-center">
          
          {/* Sub-contenedor Grid para buscador y selectores (Mantiene tu estructura de mitad y mitad) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center flex-grow w-full">
            
            {/* Lado Izquierdo: Input de Búsqueda */}
            <div className="w-full relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 select-none pointer-events-none">
                <div className='font-[iconsTwo]'>K</div>
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

        {/* --- RECIPIENTE GRID DE PRODUCTOS (80% ancho, 5 columnas) --- */}
        <div className="w-4/5 mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {productosFiltrados.map((producto) => (
            <article 
              key={producto.id} 
              className="bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md border border-gray-100/60 transition-all duration-300 flex flex-col group"
            >
              
              {/* Contenedor de Imagen */}
              <div className="relative bg-gradient-to-b from-amber-50/20 to-transparent pt-3 px-3 flex items-center justify-center h-28 overflow-hidden">
                {producto.badge && (
                  <span className="absolute top-1.5 left-1.5 bg-[#FB8500] text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider z-10">
                    {producto.badge}
                  </span>
                )}
                <img 
                  src={producto.imagen} 
                  alt={producto.nombre}
                  className="h-full w-auto object-contain drop-shadow-xs transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Información del Producto */}
              <div className="p-3 flex flex-col flex-grow justify-between space-y-2">
                <div className="space-y-1">
                  <h2 className="text-sm font-extrabold text-[#1E1E24] group-hover:text-[#E63946] transition-colors leading-tight line-clamp-1">
                    {producto.nombre}
                  </h2>
                  <p className="text-[11px] text-gray-400 font-normal line-clamp-2  leading-relaxed">
                    {producto.ingredientes}
                  </p>
                </div>

                {/* Fila de Precio y Acción */}
                <div className="flex items-center justify-between pt-1.5 border-t border-gray-50">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Precio</span>
                    <span className="text-sm font-extrabold text-[#1E1E24]">
                      ${producto.precio.toFixed(2)}
                    </span>
                  </div>

                  {esAdmin ? 
                  (
                  <div className="flex items-center space-x-1.5">
                    
                    {/* Botón 1: Editar (Lápiz sutil) */}
                    <button
                      onClick={() => console.log(`Editar producto: ${producto.nombre}`)}
                      title="Editar producto"
                      className="bg-[#FFB703] flex items-center justify-center hover:bg-[#1E1E24] text-[#1E1E24] w-7 h-7 hover:text-white p-1.5 rounded-md transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer"
                    >
                      {/* <svg xmlns="http://w3.org" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg> */}
                      <span className="font-['iconsTwo']">n</span>
                    </button>

                    {/* Botón 2: Eliminar (Cesto / Basurero sutil) */}
                    <button
                      onClick={() => console.log(`Eliminar producto: ${producto.id}`)}
                      title="Eliminar producto"
                      className="bg-gray-50 hover:bg-[#E63946] flex items-center justify-center border w-7 h-7 border-gray-100/70 text-gray-400 hover:text-white p-1.5 rounded-md transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer"
                    >
                      {/* <svg xmlns="http://w3.org" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg> */}
                      <div className="font-['iconsTwo']">o</div>
                    </button>

                  </div>
                  ):
                  (
                    <button
                    onClick={() => agregarAlCarrito(producto.id, producto.nombre)}
                    className="bg-[#FFB703] hover:bg-[#E63946] text-[#1E1E24] hover:text-white font-bold text-[11px] px-2.5 py-1.5 rounded-md flex items-center space-x-1 transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer"
                  >
                    <svg xmlns="http://w3.org" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Agregar</span>
                  </button>
                  )
                  }

                </div>
              </div>
            </article>
          ))}
        </div>

        {/* --- CONTENEDOR DE PAGINACIÓN COMPACTO (50% de ancho, centrado y sutil) --- */}
        <div className="w-max mx-auto mt-10 flex items-center justify-center gap-2 select-none">
          
          {/* Flecha Izquierda */}
          <button 
            onClick={() => moverPaginacion('izquierda')}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-white hover:bg-[#E63946] border border-gray-100/80 text-gray-400 hover:text-white rounded-lg shadow-xs transition-all cursor-pointer active:scale-90 focus:outline-none"
            title="Página Anterior"
          >
            <svg xmlns="http://w3.org" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* --- CAROUSEL INTERNO (max-w-[244px] y ref asignada) --- */}
          <div 
            ref={paginacionRef}
            className="max-w-[252px] w-full flex items-center justify-start gap-2 overflow-x-auto scrollbar-hide py-2 px-2.5 mx-auto scroll-smooth"
          >
            {/* Generamos un arreglo real del 1 al 10 para simular las páginas */}
            {Array.from({ length: 15 }, (_, i) => i + 1).map((numeroPagina) => {
              // Simulamos que la página activa actualmente es la número 1
              const esPaginaActiva = numeroPagina === 1; 
              
              return (
                <button
                  key={numeroPagina}
                  className={`flex-shrink-0 w-7 h-7 flex items-center justify-center text-xs font-black rounded-lg transition-all duration-200 shadow-xs focus:outline-none cursor-pointer ${
                    esPaginaActiva
                      ? 'bg-[#E63946] text-white ring-2 ring-[#E63946]/10 scale-105 z-10'
                      : 'bg-white text-[#1E1E24] hover:bg-[#FFB703] hover:text-[#1E1E24] border border-gray-100/80'
                  }`}
                >
                  {numeroPagina}
                </button>
              );
            })}
          </div>

          {/* Flecha Derecha */}
          <button 
            onClick={() => paginacionRef.current && moverPaginacion('derecha')}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-white hover:bg-[#E63946] border border-gray-100/80 text-gray-400 hover:text-white rounded-lg shadow-xs transition-all cursor-pointer active:scale-90 focus:outline-none"
            title="Página Siguiente"
          >
            <svg xmlns="http://w3.org" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>

        </div>
        
        {/* Aviso sutil en caso de que una categoría esté vacía */}
        {productosFiltrados.length === 0 && (
          <div className="text-center py-12 text-sm font-medium text-gray-400">
            No hay productos disponibles en esta categoría por el momento.
          </div>
        )}

      </div>
    </>
  );
}