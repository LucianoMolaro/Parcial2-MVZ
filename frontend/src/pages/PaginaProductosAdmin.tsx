import React, { useEffect, useState } from 'react';
import BarraNavegacion from '../components/Navbar';
import { BsPencilSquare, BsSearch, BsTrash } from 'react-icons/bs';
import FormularioProducto from '../components/FormularioProducto';
import { Producto } from '../models/Producto';
import { Categoria } from '../models/Categoria';


export default function PaginaProductosAdmin() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Producto | undefined>(undefined);
  const [busqueda, setBusqueda] = useState('');
  const [filtroDisponible, setFiltroDisponible] = useState('');
  const [filtroStock, setFiltroStock] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const cargarProductos = async () => {
    const res = await fetch('http://localhost:8000/productos/', { credentials: 'include' });
    if (res.ok) setProductos(await res.json());
  };

  useEffect(() => { cargarProductos(); }, []);


  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setProductoEditar(undefined);
    cargarProductos();
  };

  const eliminar = async (prod: Producto) => {
    if (!confirm(`¿Eliminar "${prod.nombre}"?`)) return;
    const res = await fetch(`http://localhost:8000/productos/${prod.id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) cargarProductos();
  };



  const productosFiltrados = productos.filter(p => {
    if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtroDisponible === 'si' && !p.disponible) return false;
    if (filtroDisponible === 'no' && p.disponible) return false;
    if (filtroStock === 'con' && p.stock_cantidad === 0) return false;
    if (filtroStock === 'sin' && p.stock_cantidad > 0) return false;
    return true;
  });

  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-6 px-4 sm:px-6 lg:px-8 font-sans antialiased">
        <div className="w-4/5 mx-auto space-y-6">

          {/* ENCABEZADO */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-red-500 tracking-tight">Productos (Admin)</h1>
            </div>
            <button
              onClick={() => { setProductoEditar(undefined); setMostrarFormulario(true); }}
              className="bg-[#1E1E24] hover:bg-[#E63946] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer focus:outline-none self-start sm:self-center"
            >
              Crear producto
            </button>
          </div>

          {mostrarFormulario && (
            <FormularioProducto isOpen={mostrarFormulario} onClose={cerrarFormulario} productoEditar={productoEditar} />
          )}

          {/* FILTROS
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none"><BsSearch /></span>
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-100/80 rounded-xl shadow-xs text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium"
              />
            </div>
            <select
              value={filtroDisponible}
              onChange={e => setFiltroDisponible(e.target.value)}
              className="w-full px-2 py-2 text-xs bg-white border border-gray-100/80 rounded-xl shadow-xs text-[#1E1E24] focus:outline-none focus:border-[#FFB703] transition-colors font-medium cursor-pointer"
            >
              <option value="">Disponibilidad (todos)</option>
              <option value="si">Disponibles</option>
              <option value="no">No disponibles</option>
            </select>
            <select
              value={filtroStock}
              onChange={e => setFiltroStock(e.target.value)}
              className="w-full px-2 py-2 text-xs bg-white border border-gray-100/80 rounded-xl shadow-xs text-[#1E1E24] focus:outline-none focus:border-[#FFB703] transition-colors font-medium cursor-pointer"
            >
              <option value="">Stock (todos)</option>
              <option value="con">Con stock</option>
              <option value="sin">Sin stock</option>
            </select>
          </div> */}

          {/* LISTA */}
          <div className="space-y-2.5">
            {productosFiltrados.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-xl p-3.5 border border-gray-100/70 shadow-xs flex items-center justify-between gap-4 transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-center space-x-4 min-w-0 flex-row">
                  <img
                    src={prod.imagenes_url?.[0] ?? ''}
                    alt={prod.nombre}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-50 flex-shrink-0 bg-gray-50"
                  />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-[#1E1E24] leading-tight truncate">{prod.nombre}</h3>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${prod.disponible ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                        {prod.disponible ? 'Disponible' : 'No disponible'}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${prod.habilitado ? 'bg-green-50 text-green-600 border-green-200' : 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                        {prod.habilitado ? 'Habilitado' : 'Deshabilitado'}
                      </span>
                    </div>
                    <div className="mt-1 space-y-0.5 text-[11px] font-medium text-stone-500">
                      <div className="flex items-center gap-1">
                        <span>Precio:</span>
                        <span className="font-bold text-stone-700">${prod.precio.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Descripción:</span>
                        <span className="font-normal text-stone-600 truncate max-w-xs md:max-w-md">{prod.descripcion ?? '-'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Stock:</span>
                        <span className={`font-semibold ${prod.stock_cantidad === 0 ? 'text-red-500' : 'text-stone-700'}`}>
                          {prod.stock_cantidad} unidades
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => { setProductoEditar(prod); setMostrarFormulario(true); }}
                    title="Editar producto"
                    className="bg-[#FFB703] hover:bg-[#1E1E24] text-[#1E1E24] hover:text-white p-1.5 rounded-lg transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none flex items-center justify-center"
                  >
                    <BsPencilSquare className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => eliminar(prod)}
                    title="Eliminar del catálogo"
                    className="bg-gray-50 hover:bg-[#E63946] border border-gray-100/70 text-gray-400 hover:text-white p-1.5 rounded-lg transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none flex items-center justify-center"
                  >
                    <BsTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {productosFiltrados.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100/60 p-8 text-center text-xs font-medium text-gray-400">
                No hay productos que coincidan con los filtros.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
