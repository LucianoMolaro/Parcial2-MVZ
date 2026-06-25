import { useRef, useState } from 'react';
import BarraNavegacion from '../components/Navbar';

interface Direccion {
  id: number;
  Alias: string;
  Calle: string;
  Altura: string;
  Ciudad: string;
  esprincipal: boolean;
}

const PEDIDOS_MOCK: Direccion[] = [
    { id: 5, Alias: 'Casa', Calle: 'Cordoba', Altura: '38', Ciudad: 'Godoy Cruz', esprincipal: true },
    // { id: 4, Alias: 'Trabajo', Calle: 'Panamericana', Altura: '700', Ciudad: 'Godoy Cruz', esprincipal: false },
    // { id: 3, Alias: 'Casa firi', Calle: 'J.Newbery', Altura: '853', Ciudad: 'Las Heras', esprincipal: false },
    // { id: 2, Alias: 'Casa Kafundit', Calle: 'Navarro', Altura: '850', Ciudad: 'Godoy Cruz', esprincipal: false },
    // { id: 1, Alias: 'Casa firi', Calle: 'J.Newbery', Altura: '853', Ciudad: 'Las Heras', esprincipal: false }
];

export default function PaginaDirecciones() {
  const [direccion] = useState<Direccion[]>(PEDIDOS_MOCK);
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
    
  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-4 px-4 sm:px-6 lg:px-8">
        
        {/* --- ENCABEZADO DE LA SECCIÓN (Alineado al ancho del bloque) --- */}
        <div className="w-full md:w-3/5 lg:w-1/2 mx-auto mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#1E1E24] tracking-tight sm:text-2xl">
              Mis <span className="text-[#E63946]">Direcciones</span>
            </h1>
          </div>
          
          {/* Botón sutil para agregar dirección (UX mejorada) */}
          <button className="bg-[#1E1E24] hover:bg-[#E63946] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer">
            + Nueva
          </button>
        </div>

        {/* --- LISTADO DE TARJETAS HORIZONTALES (Ancho calibrado a escala sutil) --- */}
        <div className="w-full md:w-3/5 lg:w-1/2 mx-auto space-y-3">
          {direccion.map((dir) => (
            <article 
              key={dir.id}
              className="bg-white rounded-xl border border-gray-100/70 p-4 shadow-xs flex flex-row items-center justify-between gap-4 transition-all duration-300 hover:shadow-md"
            >
              {/* LADO IZQUIERDO: Información del domicilio */}
              <div className="space-y-1 flex-grow min-w-0">
                  
                {/* Fila superior: Alias y Estrella Principal */}
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-black text-[#1E1E24] tracking-tight">
                    {dir.Alias}
                  </h2>
                  {dir.esprincipal && (
                    <svg 
                      xmlns="http://w3.org" 
                      className="h-3.5 w-3.5 flex-shrink-0" 
                      fill="#FFB703" 
                      viewBox="0 0 24 24" 
                      stroke="#FFB703" 
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.151-.312.592-.312.743 0l2.257 4.574a.423.423 0 00.319.232l5.048.734c.344.05.482.472.233.717l-3.653 3.562a.42.42 0 00-.121.373l.862 5.028c.059.343-.301.605-.609.444l-4.516-2.375a.417.417 0 00-.385 0l-4.516 2.375c-.308.162-.668-.1-.609-.444l.862-5.028a.42.42 0 00-.121-.373L2.64 10.756c-.249-.245-.11-.667.233-.717l5.048-.734a.423.423 0 00.319-.232l2.257-4.574z" />
                    </svg>
                  )}
                </div>

                {/* Detalles del Domicilio en formato de texto sutil */}
                <div className="text-xs text-gray-500 font-medium space-y-0.5">
                  <p>Calle: <span className="text-[#1E1E24] font-semibold">{dir.Calle} {dir.Altura}</span></p>
                  <p>Ciudad: <span className="text-[#1E1E24] font-semibold">{dir.Ciudad}</span></p>
                </div>
              </div>

              {/* LADO DERECHO: Botones alineados horizontalmente */}
              <div className="flex-shrink-0 flex items-center space-x-2">
                {/* Botón Editar */}
                <button
                  onClick={() => console.log(`Editar dirección #${dir.id}`)}
                  title="Editar dirección"
                  className="bg-[#FFB703] hover:bg-[#1E1E24] text-[#1E1E24] hover:text-white p-1.5 rounded-md transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer"
                >
                  <svg xmlns="http://w3.org" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>

                {/* Botón Eliminar */}
                <button
                  onClick={() => console.log(`Eliminar dirección #${dir.id}`)}
                  title="Eliminar dirección"
                  className="bg-gray-50 hover:bg-[#E63946] border border-gray-100/70 text-gray-400 hover:text-white p-1.5 rounded-md transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer"
                >
                  <svg xmlns="http://w3.org" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

            </article>
          ))}
        </div>
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
            {Array.from({ length: 9 }, (_, i) => i + 1).map((numeroPagina) => {
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
      </div>
    </>
  );
}