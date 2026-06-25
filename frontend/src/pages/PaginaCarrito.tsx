import React, { useState } from 'react';
import BarraNavegacion from '../components/Navbar';

interface ProductoCarrito {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
  ingredientesBorrados: string[]; // Registro de personalización del cliente
}

// Datos Mock iniciales para visualizar y realizar pruebas
const PRODUCTOS_CARRITO_MOCK: ProductoCarrito[] = [
  {
    id: 1,
    nombre: "Mega Burger Triple Queso",
    precio: 8.99,
    imagen: "",
    cantidad: 2,
    ingredientesBorrados: ["Cebolla caramelizada"]
  },
  {
    id: 2,
    nombre: "Papas Cheddar & Bacon",
    precio: 4.99,
    imagen: "",
    cantidad: 1,
    ingredientesBorrados: []
  }
];

export default function PaginaCarrito() {
  const [itemsCarrito, setItemsCarrito] = useState<ProductoCarrito[]>(PRODUCTOS_CARRITO_MOCK);
  
  // Variables financieras del resumen
  const subtotal = itemsCarrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const descuento = subtotal > 15 ? 2.50 : 0.00; // Descuento simulado
  const costoEnvio = subtotal > 0 ? 1.99 : 0.00;
  const total = subtotal - descuento + costoEnvio;

  // Lógica de control de cantidades
  const cambiarCantidad = (id: number, incremento: number) => {
    setItemsCarrito(prev => 
      prev.map(item => {
        if (item.id === id) {
          const nuevaCantidad = item.cantidad + incremento;
          return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item;
        }
        return item;
      })
    );
  };

  const eliminarProducto = (id: number) => {
    setItemsCarrito(prev => prev.filter(item => item.id !== id));
  };

  const personalizarProducto = (nombre: string) => {
    alert(`Abrir modal de personalización para: ${nombre} (Quitar cebolla, pepinillos, aderezos...)`);
  };

  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8">
        
        {/* --- CONTENEDOR GENERAL DE DISTRIBUCIÓN (80% de ancho) --- */}
        <div className="w-4/5 mx-auto lg:flex lg:gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* LADO IZQUIERDO: LISTADO DE PRODUCTOS (65% Width aproximado con lg:w-2/3) */}
          {/* ========================================================================= */}
          <div className="w-full lg:w-2/3 space-y-4 mb-6 lg:mb-0">
            <h1 className="text-xl font-extrabold text-[#1E1E24] tracking-tight mb-2">
              Tu Carrito <span className="text-[#E63946]">({itemsCarrito.length} artículos)</span>
            </h1>

            {itemsCarrito.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100/60 p-8 text-center text-xs font-medium text-gray-400">
                Tu carrito está vacío. ¡Agrega tus antojos favoritos en el menú!
              </div>
            ) : (
              itemsCarrito.map((item) => (
                <article 
                  key={item.id} 
                  className="bg-white rounded-xl p-3 border border-gray-100/60 shadow-xs flex items-center justify-between gap-4"
                >
                  {/* Imagen y Detalles del Producto */}
                  <div className="flex items-center space-x-3 flex-grow">
                    <div className="w-14 h-14 bg-gradient-to-b from-amber-50/20 to-transparent rounded-lg flex items-center justify-center overflow-hidden border border-gray-50 flex-shrink-0">
                      <img src={item.imagen} alt={item.nombre} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-[#1E1E24] leading-tight">{item.nombre}</h2>
                      <span className="text-xs font-bold text-[#E63946] block mt-0.5">${item.precio.toFixed(2)}</span>
                      
                      {/* Badge sutil de ingredientes modificados */}
                      {item.ingredientesBorrados.length > 0 && (
                        <p className="text-[10px] text-gray-400 font-medium mt-1">
                          🚫 Sin: {item.ingredientesBorrados.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* --- BLOQUE DE TRES ACCIONES EXIGIDAS --- */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    
                    {/* Botón 1: Personalizar (Sutil gris con hover de cambio de ingrediente) */}
                    <button
                      onClick={() => personalizarProducto(item.nombre)}
                      className="px-2.5 py-1.5 text-[10px] font-bold text-gray-500 bg-gray-50 hover:bg-amber-100 hover:text-[#1E1E24] rounded-md transition-colors border border-gray-100 cursor-pointer"
                    >
                      Personalizar
                    </button>

                    {/* Botón 2: Control de Cantidad (+ / - integrado) */}
                    <div className="flex items-center bg-gray-50 rounded-md border border-gray-100 overflow-hidden h-7">
                      <button 
                        onClick={() => cambiarCantidad(item.id, -1)}
                        className="px-2 text-xs font-bold text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-black text-[#1E1E24] select-none min-w-[20px] text-center">
                        {item.cantidad ?? item.cantidad}
                      </span>
                      <button 
                        onClick={() => cambiarCantidad(item.id, 1)}
                        className="px-2 text-xs font-bold text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Botón 3: Eliminar del carrito por completo (Icono papelera / X sutil) */}
                    <button
                      onClick={() => eliminarProducto(item.id)}
                      title="Eliminar del carrito"
                      className="p-1.5 text-gray-400 hover:text-[#E63946] hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                    >
                      <svg xmlns="http://w3.org" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                  </div>
                </article>
              ))
            )}
          </div>

          {/* ========================================================================= */}
          {/* LADO DERECHO: RESUMEN DEL PEDIDO (35% Width aproximado con lg:w-1/3) */}
          {/* ========================================================================= */}
          <div className="w-full lg:w-1/3">
            <h2 className="text-xl font-extrabold text-[#1E1E24] tracking-tight mb-2 opacity-0 lg:opacity-100 pointer-events-none">
              Resumen
            </h2>
            
            <div className="bg-white rounded-xl border border-gray-100/60 shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-[#1E1E24] border-b border-gray-50 pb-2">
                Resumen del Pedido
              </h3>

              {/* Detalles financieros individuales */}
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

              {/* --- SECCIÓN: DIRECCIÓN DE ENTREGA --- */}
              <div className="pt-3 border-t border-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Dirección de Entrega
                  </label>
                  
                  <button
                    onClick={() => console.log("Abrir modal o vista para crear dirección")}
                    className="text-[10px] font-bold text-[#E63946] hover:text-[#1E1E24] transition-colors focus:outline-none cursor-pointer flex items-center space-x-0.5"
                    title="Agregar nueva dirección"
                  >
                    <span>+ Nueva</span>
                  </button>
                </div>

                <div className="w-full">
                  <select
                    className="w-full px-2.5 py-2 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] transition-colors font-medium cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled hidden>Selecciona dónde entregamos...</option>
                    <option value="casa">🏠 Casa (Av. Principal 123)</option>
                    <option value="oficina">🏢 Oficina (Calle 45 #789)</option>
                  </select>
                </div>
              </div>

              {/* --- SECCIÓN NUEVA: MÉTODO DE PAGO (Sin botón de agregar) --- */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Método de Pago
                </label>

                <div className="w-full">
                  <select
                    className="w-full px-2.5 py-2 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] transition-colors font-medium cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled hidden>Selecciona cómo pagar...</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="mercadopago">Mercado Pago</option>
                  </select>
                </div>
              </div>

              {/* Total Final */}
              <div className="flex justify-between items-end pt-3 border-t border-gray-50">
                <span className="text-xs font-bold text-[#1E1E24] uppercase tracking-wider">Total</span>
                <span className="text-xl font-black text-[#1E1E24]">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Botón de Ir a Pagar (Principal CTA) */}
              <button
                disabled={itemsCarrito.length === 0}
                className="w-full bg-[#E63946] hover:bg-opacity-95 disabled:bg-gray-200 text-white font-extrabold text-xs py-2.5 px-4 rounded-lg tracking-wider uppercase transition-all shadow-xs active:scale-98 focus:outline-none cursor-pointer disabled:cursor-not-allowed text-center"
              >
                Ir a Pagar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}