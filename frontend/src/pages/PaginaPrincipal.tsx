import BarraNavegacion from "../components/Navbar";



export default function PaginaPrincipal() {  
  return (
    
      <div className="min-h-screen bg-[#FAFAFA] text-[#1E1E24] font-sans antialiased">

        <BarraNavegacion/>

        {/* --- HERO SECTION --- */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Textos y CTA */}
            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-[#1E1E24] leading-tight">
                ¡Pide Ya Tus <br />
                <span className="text-[#E63946]">Antojos!</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 font-medium tracking-wide">
                Rápido. Sabroso. A domicilio.
              </p>
              <div className="pt-4">
                <button className="bg-[#E63946] text-white text-base font-extrabold px-8 py-4 rounded-full shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-wider">
                  Pedir Ahora
                </button>
              </div>
            </div>

            {/* Imagen de Comida Principal */}
            <div className="relative flex justify-center">
              <div className="w-full max-w-lg aspect-square bg-gradient-to-tr from-amber-100 to-transparent rounded-full absolute -z-10 blur-2xl"></div>
              <img 
                src="" 
                alt="Combo hamburguesa con papas y refresco" 
                className="w-full h-auto object-contain max-w-md drop-shadow-2xl transform hover:rotate-2 transition-transform duration-300"
              />
            </div>
          </div>

          {/* --- GRID DE CATEGORÍAS Y OFERTAS --- */}
          <section className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            
            {/* Tarjeta 1: Hamburguesas */}
            <div className="bg-[#FFB703] rounded-2xl p-5 flex flex-col justify-between h-48 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all">
              <h3 className="font-extrabold text-lg text-[#1E1E24] z-10">Hamburguesas</h3>
              <div className="absolute bottom-2 right-2 w-28 h-28 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <img src="" alt="Hamburguesa" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Tarjeta 2: Pizzas */}
            <div className="bg-[#FFB703] rounded-2xl p-5 flex flex-col justify-between h-48 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all">
              <h3 className="font-extrabold text-lg text-[#1E1E24] z-10">Pizzas</h3>
              <div className="absolute bottom-2 right-2 w-28 h-28 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <img src="" alt="Pizza" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Tarjeta 3: Snacks & Más */}
            <div className="bg-[#FFB703] rounded-2xl p-5 flex flex-col justify-between h-48 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all">
              <h3 className="font-extrabold text-lg text-[#1E1E24] z-10">Snacks & Más</h3>
              <div className="absolute bottom-2 right-2 w-28 h-28 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <img src="" alt="Papas fritas" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Tarjeta 4: Oferta Especial */}
            <div className="bg-[#FB8500] text-white rounded-2xl p-5 flex flex-col justify-between h-48 relative overflow-hidden shadow-sm">
              <div className="z-10">
                <span className="bg-[#1E1E24] text-[#FFB703] text-xs font-black px-2 py-1 rounded uppercase tracking-wider">
                  Oferta del Día
                </span>
                <h3 className="font-black text-2xl mt-3 leading-tight tracking-tight">
                  2x1 en Nachos
                </h3>
              </div>
              {/* Patrón de fondo sutil o icono decorativo */}
              <div className="absolute -bottom-4 -right-4 text-white/10 text-9xl font-black select-none pointer-events-none">
                🌮
              </div>
            </div>

          </section>
        </main>
      </div>
  );
}