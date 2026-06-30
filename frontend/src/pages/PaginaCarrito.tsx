import React, { useState } from 'react';
import BarraNavegacion from '../components/Navbar';
import { useCarrito } from '../context/CarritoContext';
import { ProductoPublic } from '../models/Producto';
import { Ingrediente } from '../models/Ingrediente';
import { useWsEvent } from '../context/WebSocketContext';
import { WsEvent } from '../models/WebSockets';
 // ajustá el path a tus tipos

// ── Mock de productos completos (reemplazá por fetch cuando conectes el backend) ──
const PRODUCTOS_MOCK: ProductoPublic[] = [
  {
    id: 1,
    nombre: "Mega Burger Triple Queso",
    descripcion: "Triple carne de res, triple cheddar, tocino crujiente, cebolla caramelizada y salsa secreta.",
    precio: 8.99,
    imagenes: [],
    stock: 20,
    ingredientes: [
      { id: 1, nombre: "Cheddar",           es_alergeno: true,  es_removible: true,  stock: 50 ,imagen:""},
      { id: 2, nombre: "Tocino",            es_alergeno: false, es_removible: true,  stock: 30 ,imagen:""},
      { id: 3, nombre: "Cebolla caramelizada", es_alergeno: false, es_removible: true, stock: 40 , imagen:""},
    ],
  },
  {
    id: 2,
    nombre: "Pizza Pepperoni Suprema",
    descripcion: "Masa artesanal, salsa de tomate premium, doble mozzarella, abundante pepperoni.",
    precio: 12.50,
    imagenes: [],
    stock: 15,
    ingredientes: [
      { id: 4, nombre: "Mozzarella",  es_alergeno: true,  es_removible: true,  stock: 60 , imagen:""},
      { id: 5, nombre: "Pepperoni",   es_alergeno: false, es_removible: true,  stock: 45 , imagen:""},
    ],
  },
  {
    id: 3,
    nombre: "Crispy Chicken Tenders",
    descripcion: "6 piezas de pechuga de pollo marinada, empanizado extra crujiente con salsa BBQ.",
    precio: 6.50,
    imagenes: [],
    stock: 25,
    ingredientes: [
      { id: 6, nombre: "Salsa BBQ", es_alergeno: false, es_removible: true, stock: 80 ,imagen:""},
    ],
  },
  {
    id: 4,
    nombre: "Papas Cheddar & Bacon",
    descripcion: "Porción grande de papas fritas rústicas bañadas en nuestra salsa de queso cheddar fundido.",
    precio: 4.99,
    imagenes: [],
    stock: 30,
    ingredientes: [
      { id: 1, nombre: "Cheddar", es_alergeno: true,  es_removible: true, stock: 50 , imagen:""},
      { id: 2, nombre: "Tocino",  es_alergeno: false, es_removible: true, stock: 30 , imagen:""},
    ],
  },
  {
    id: 5,
    nombre: "Burger BBQ Ahumada",
    descripcion: "Carne a la parrilla, queso monterey jack, aros de cebolla apanados, lechuga y tomate.",
    precio: 9.25,
    imagenes: [],
    stock: 18,
    ingredientes: [
      { id: 7, nombre: "Monterey Jack",  es_alergeno: true,  es_removible: true, stock: 35 , imagen:""},
      { id: 8, nombre: "Aros de cebolla", es_alergeno: false, es_removible: true, stock: 20 , imagen:""},
    ],
  },
  {
    id: 7,
    nombre: "Combo Tequeños Auténticos",
    descripcion: "8 deditos de masa crujiente rellenos de abundante queso blanco derretido.",
    precio: 5.75,
    imagenes: [],
    stock: 40,
    ingredientes: [
      { id: 9, nombre: "Queso blanco", es_alergeno: true, es_removible: false, stock: 70 , imagen:""},
    ],
  },
];


export default function PaginaCarrito() {
  const { state, incrementar, decrementar, eliminar, quitarIngrediente, restaurarIngrediente } = useCarrito();
  const [sinStock, setSinStock] = useState<Set<number>>(new Set());

  useWsEvent('producto_sin_stock', (evt: WsEvent) => {
    const d = evt.data as { producto_id: number };
    setSinStock(prev => new Set([...prev, d.producto_id]));
  });

  // Cruzamos los items del carrito con los datos completos del producto
  const itemsCarrito = state.items
    .map((item) => ({
      ...item,
      producto: PRODUCTOS_MOCK.find((p) => p.id === item.id),
    }))
    .filter((item) => item.producto !== undefined) as Array<{
      id: number;
      cantidad: number;
      personalizacion: number[];
      producto: ProductoPublic;
    }>;

  // Variables financieras del resumen
  const subtotal  = itemsCarrito.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  const descuento = subtotal > 15 ? 2.50 : 0.00;
  const costoEnvio = subtotal > 0 ? 1.99 : 0.00;
  const total = subtotal - descuento + costoEnvio;

  const personalizarProducto = (nombre: string) => {
    alert(`Abrir modal de personalización para: ${nombre} (Quitar cebolla, pepinillos, aderezos...)`);
  };

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
                // Ingredientes quitados: cruzamos los IDs de personalizacion con los del producto
                const ingredientesQuitados = item.producto.ingredientes.filter((ing: Ingrediente) =>
                  item.personalizacion.includes(ing.id)
                );

                return (
                  <article
                    key={item.id}
                    className="bg-white rounded-xl p-3 border border-gray-100/60 shadow-xs flex items-center justify-between gap-4"
                  >
                    {/* Imagen y Detalles del Producto */}
                    <div className="flex items-center space-x-3 flex-grow">
                      <div className="w-14 h-14 bg-gradient-to-b from-amber-50/20 to-transparent rounded-lg flex items-center justify-center overflow-hidden border border-gray-50 flex-shrink-0">
                        <img
                          src={item.producto.imagenes[0]?.url ?? ""}
                          alt={item.producto.nombre}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h2 className="text-sm font-extrabold text-[#1E1E24] leading-tight">{item.producto.nombre}</h2>
                        <span className="text-xs font-bold text-[#E63946] block mt-0.5">${item.producto.precio.toFixed(2)}</span>
                        
                        {/* Badge de ingredientes quitados */}
                        {ingredientesQuitados.length > 0 && (
                          <p className="text-[10px] text-gray-400 font-medium mt-1">
                            🚫 Sin: {ingredientesQuitados.map((ing: Ingrediente) => ing.nombre).join(', ')}
                          </p>
                        )}
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

              {/* Método de pago */}
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
                disabled={itemsCarrito.length === 0 || itemsCarrito.some(item => sinStock.has(item.id))}
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