import { useEffect, useRef, useState } from "react";
import { useFiltros } from "../context/FiltrosContext";

export default function NavPag({ paginanombre }: { paginanombre: string }){

    const { state, dispatch, limpiarFiltros } = useFiltros();
    const paginacionRef = useRef<HTMLDivElement>(null);
    const moverPaginacion = (direccion: "izquierda" | "derecha") => {
    paginacionRef.current?.scrollBy({
        left: direccion === "izquierda" ? -72 : 72,
        behavior: "smooth",
        });
    };

    useEffect(()=>{
        const totales = fetch(`http://localhost:3001/${paginanombre}/totales`)
    }, [])


    return  (
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
            {Array.from({ length: 15 }, (_, i) => i + 1).map((numeroPagina) => (
              <button
                key={numeroPagina}
                onClick={() => dispatch({ type: "SET_PAGINA", payload: numeroPagina })}
                className={`flex-shrink-0 w-7 h-7 flex items-center justify-center text-xs font-black rounded-lg transition-all duration-200 shadow-xs focus:outline-none cursor-pointer ${
                  state.pagina === numeroPagina
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
    )
}