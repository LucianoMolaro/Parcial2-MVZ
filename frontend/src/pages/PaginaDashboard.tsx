import React, { useEffect, useState } from 'react';
import BarraNavegacion from '../components/Navbar';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

interface PedidoResumen {
  id: number;
  estado_codigo: string;
  total: string;
  created_at: string | null;
  detalles: { nombre: string; cantidad: number }[];
}

interface ProductoResumen {
  id: number;
  nombre: string;
  stock_cantidad: number;
}

const COLORES_ESTADO: Record<string, string> = {
  CONFIRMADO: '#3B82F6',
  EN_PREP: '#FFB703',
  EN_CAMINO: '#6366F1',
  ENTREGADO: '#10B981',
  CANCELADO: '#E63946',
  PENDIENTE: '#9CA3AF',
};

export default function PaginaDashboard() {
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [productos, setProductos] = useState<ProductoResumen[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/pedidos/?limit=100', { credentials: 'include' })
      .then(r => r.json()).then(setPedidos).catch(() => {});
    fetch('http://localhost:8000/productos/', { credentials: 'include' })
      .then(r => r.json()).then(setProductos).catch(() => {});
  }, []);

  // KPIs derivados
  const totalVentas = pedidos.filter(p => p.estado_codigo === 'ENTREGADO').reduce((s, p) => s + Number(p.total), 0);
  const totalPedidos = pedidos.length;
  const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;
  const alertasStock = productos.filter(p => p.stock_cantidad === 0).length;

  const metricas = [
    { id: 1, titulo: 'Ventas entregadas', valor: `$${totalVentas.toFixed(2)}`, extra: `${pedidos.filter(p => p.estado_codigo === 'ENTREGADO').length} pedidos` },
    { id: 2, titulo: 'Pedidos Totales', valor: String(totalPedidos), extra: 'en sistema' },
    { id: 3, titulo: 'Ticket Promedio', valor: `$${ticketPromedio.toFixed(2)}`, extra: 'por pedido' },
    { id: 4, titulo: 'Alertas de Stock', valor: `${alertasStock} Ítems`, extra: alertasStock > 0 ? 'Revisar' : 'OK' },
  ];

  // Gráfico pie de estados actuales
  const estadosCount: Record<string, number> = {};
  pedidos.forEach(p => { estadosCount[p.estado_codigo] = (estadosCount[p.estado_codigo] ?? 0) + 1; });
  const dataEstados = Object.entries(estadosCount).map(([name, value]) => ({
    name, value, color: COLORES_ESTADO[name] ?? '#9CA3AF',
  }));

  // Top 5 productos más pedidos
  const productosCount: Record<string, number> = {};
  pedidos.forEach(p => p.detalles?.forEach(d => {
    productosCount[d.nombre] = (productosCount[d.nombre] ?? 0) + d.cantidad;
  }));
  const dataProductos = Object.entries(productosCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, cantidad]) => ({ name, cantidad }));

  // Ventas por día (últimos 7 días)
  const hoy = new Date();
  const dataVentasDias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy); d.setDate(hoy.getDate() - (6 - i));
    const label = d.toLocaleDateString('es-AR', { weekday: 'short' });
    const total = pedidos
      .filter(p => p.created_at && new Date(p.created_at).toDateString() === d.toDateString())
      .reduce((s, p) => s + Number(p.total), 0);
    return { name: label, ventas: Number(total.toFixed(2)) };
  });

  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
        <div className="w-4/5 mx-auto space-y-6">

          <div>
            <h1 className="text-xl font-extrabold text-[#1E1E24] tracking-tight sm:text-2xl">
              Panel de <span className="text-[#E63946]">Control Comercial</span>
            </h1>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metricas.map((kpi) => (
              <div key={kpi.id} className="bg-white rounded-xl border border-gray-100/70 p-4 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{kpi.titulo}</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-black text-[#1E1E24]">{kpi.valor}</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-gray-50 text-gray-500 border border-gray-100/40">{kpi.extra}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Ventas diarias */}
            <div className="bg-white rounded-xl border border-gray-100/70 p-4 shadow-xs space-y-3">
              <div>
                <h3 className="text-xs font-bold text-[#1E1E24] uppercase tracking-wider text-gray-400">Tendencia de Ventas ($)</h3>
                <p className="text-sm font-black text-[#1E1E24]">Últimos 7 días</p>
              </div>
              <div className="h-48 text-[11px] font-semibold">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataVentasDias} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ fontFamily: 'sans-serif', fontSize: '11px', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="ventas" stroke="#E63946" strokeWidth={3} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top productos */}
            <div className="bg-white rounded-xl border border-gray-100/70 p-4 shadow-xs space-y-3">
              <div>
                <h3 className="text-xs font-bold text-[#1E1E24] uppercase tracking-wider text-gray-400">Salida de Inventario</h3>
                <p className="text-sm font-black text-[#1E1E24]">Top 5 Productos más Vendidos</p>
              </div>
              <div className="h-48 text-[11px] font-semibold">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataProductos} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ fontFamily: 'sans-serif', fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                      {dataProductos.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#E63946' : '#FFB703'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribución de estados */}
            <div className="bg-white rounded-xl border border-gray-100/70 p-4 shadow-xs space-y-3">
              <div>
                <h3 className="text-xs font-bold text-[#1E1E24] uppercase tracking-wider text-gray-400">Flujo de Cocina</h3>
                <p className="text-sm font-black text-[#1E1E24]">Distribución de Estados Actuales</p>
              </div>
              <div className="h-48 text-[10px] font-bold">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dataEstados} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                      {dataEstados.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontFamily: 'sans-serif', fontSize: '11px', borderRadius: '8px' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Alertas de stock */}
            <div className="bg-white rounded-xl border border-gray-100/70 p-4 shadow-xs space-y-3">
              <div>
                <h3 className="text-xs font-bold text-[#1E1E24] uppercase tracking-wider text-gray-400">Alertas de Stock</h3>
                <p className="text-sm font-black text-[#1E1E24]">Productos sin stock disponible</p>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-40">
                {productos.filter(p => p.stock_cantidad === 0).map(p => (
                  <div key={p.id} className="flex items-center justify-between text-xs px-3 py-2 bg-red-50 rounded-lg border border-red-100">
                    <span className="font-bold text-[#1E1E24]">{p.nombre}</span>
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-wide">Sin stock</span>
                  </div>
                ))}
                {productos.filter(p => p.stock_cantidad === 0).length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No hay alertas de stock.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
