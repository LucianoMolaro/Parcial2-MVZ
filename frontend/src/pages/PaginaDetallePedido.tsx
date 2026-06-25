import React from 'react';
import BarraNavegacion from '../components/Navbar';
import { useParams } from 'react-router-dom';

interface ProductoDetalle {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  ingredientesBorrados: string[];
}

interface PedidoInfo {
  id: number;
  estado: 'Confirmado' | 'En preparación' | 'En camino' | 'Entregado';
  fecha: string;
  hora: string;
  direccion: string;
  metodoPago: string;
  productos: ProductoDetalle[];
}

const PEDIDO_DETALLE_MOCK: PedidoInfo = {
  id: 5,
  estado: 'En preparación',
  fecha: '23 Jun 2026',
  hora: '20:15',
  direccion: '🏠 Casa (Av. Principal 123)',
  metodoPago: '📱 Mercado Pago',
  productos: [
    {
      id: 1,
      nombre: "Mega Burger Triple Queso",
      precio: 8.99,
      cantidad: 2,
      ingredientesBorrados: ["Cebolla caramelizada"]
    },
    {
      id: 2,
      nombre: "Papas Cheddar & Bacon",
      precio: 4.99,
      cantidad: 1,
      ingredientesBorrados: []
    }
  ]
};

export default function PaginaDetallePedido() {
    const { id } = useParams<{ id: string }>(); 
    const pedido = PEDIDO_DETALLE_MOCK;
    const esAdmin=false

    // Cálculos financieros automáticos
    const subtotal = pedido.productos.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    const descuento = subtotal > 15 ? 2.50 : 0.00;
    const costoEnvio = 1.99;
    const total = subtotal - descuento + costoEnvio;

    // Pasos del rastreador superior
    const pasos = ['Confirmado', 'En preparación', 'En camino', 'Entregado', 'Listo'];
    const indiceActual = pasos.indexOf(pedido.estado);

  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
        <div className="w-4/5 mx-auto space-y-7">
          
          {/* --- ENCABEZADO Y RASTREADOR DE ESTADO SUTIL --- */}
          <div className="bg-white rounded-xl border border-gray-100/70 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-50 pb-4 mb-4 gap-2">
              <div>
                <h1 className="text-xl font-black text-[#1E1E24] tracking-tight">Detalle del Pedido #{id}</h1>
                {/* ✅ CORREGIDO: Uso de && y llaves de cierre correctas */}
                {esAdmin && (
                    <div className="flex flex-wrap gap-x-2 text-s font-bold text-[#E63946] tracking-tight">
                        <span>Cliente: <span className="text-[#1E1E24] font-medium">Juan Pérez (ID: 1514)</span></span>
                    </div>
                )}
                <p className="text-[12px] text-gray-400 font-medium">Realizado el {pedido.fecha} a las {pedido.hora} hs</p>
                
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider self-start sm:self-center">
                {pedido.estado}
              </span>
            </div>

            {/* Línea de tiempo visual (Stepper) */}
            <div className="grid grid-cols-5 gap-2 relative pt-2">
              {pasos.map((paso, index) => {
                const completado = index <= indiceActual;
                return (
                  <div key={paso} className="text-center space-y-2 flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-colors ${
                      completado 
                        ? 'bg-[#E63946] text-white border-[#E63946]' 
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`text-[10px] font-bold tracking-tight uppercase ${
                      completado ? 'text-[#1E1E24]' : 'text-gray-400'
                    }`}>
                      {paso}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- BLOQUE DE DISTRIBUCIÓN PRINCIPAL (65% / 35%) --- */}
          <div className="lg:flex lg:gap-6 items-start">
            
            {/* LADO IZQUIERDO: PRODUCTOS DEL PEDIDO (65%) */}
            <div className="w-full lg:w-2/3 space-y-3 mb-6 lg:mb-0">
              <h2 className="text-sm font-extrabold text-[#1E1E24] uppercase tracking-wider">Productos pedidos</h2>
              
              {pedido.productos.map((producto) => (
                <article 
                  key={producto.id}
                  className="bg-white rounded-xl p-4 border border-gray-100/70 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-[#1E1E24] leading-tight">{producto.nombre}</h3>
                    <p className="text-xs font-bold text-gray-400 mt-0.5">Cantidad: <span className="text-[#1E1E24]">{producto.cantidad}</span></p>
                    
                    {producto.ingredientesBorrados.length > 0 && (
                      <p className="text-[10px] text-gray-400 font-medium mt-1">
                        🚫 Sin: {producto.ingredientesBorrados.join(', ')}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-black text-[#1E1E24] block">
                      ${(producto.precio * producto.cantidad).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium block">
                      ${producto.precio.toFixed(2)} c/u
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {/* LADO DERECHO: DETALLES DE ENTREGA Y MONTOS (35%) */}
            <div className="w-full lg:w-1/3 space-y-4">
              <h2 className="text-sm font-extrabold text-[#1E1E24] uppercase tracking-wider text-gray-400">Resumen y Logística</h2>
              
              <div className="bg-white rounded-xl border border-gray-100/70 shadow-xs p-5 space-y-4">
                
                {/* Datos de Entrega */}
                <div className="space-y-3 border-b border-gray-50 pb-3">
                  <div className="space-y-0.5">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dirección de Envío</h4>
                    <p className="text-xs font-semibold text-[#1E1E24]">{pedido.direccion}</p>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Método de Pago</h4>
                    <p className="text-xs font-semibold text-[#1E1E24]">{pedido.metodoPago}</p>
                  </div>
                </div>

                {/* Desglose Monetario */}
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
                    <span className="text-[#1E1E24] font-bold">${costoEnvio.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total Final */}
                <div className="flex justify-between items-end pt-3 border-t border-gray-50">
                  <span className="text-xs font-bold text-[#1E1E24] uppercase tracking-wider">Total Pagado</span>
                  <span className="text-xl font-black text-[#1E1E24]">
                    ${total.toFixed(2)}
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}