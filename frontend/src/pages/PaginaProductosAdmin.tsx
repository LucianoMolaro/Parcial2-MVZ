import React, { useEffect, useState } from 'react';
import BarraNavegacion from '../components/Navbar';
import { BsPencilSquare, BsTrash } from 'react-icons/bs';
import FormularioProducto from '../components/FormularioProducto';

interface ProductoAdmin {
  id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  imagen_url?: string;
  disponible: boolean;
  stock_cantidad: number;
  habilitado?: boolean;
}

export default function PaginaProductosAdmin() {
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditar, setProductoEditar] = useState<ProductoAdmin | undefined>(undefined);

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

  const eliminar = async (prod: ProductoAdmin) => {
    if (!confirm(`¿Eliminar "${prod.nombre}"?`)) return;
    const res = await fetch(`http://localhost:8000/productos/${prod.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) cargarProductos();
  };

  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-6 px-4 sm:px-6 lg:px-8 font-sans antialiased">
        <div className="w-4/5 mx-auto space-y-6">

          {/* --- ENCABEZADO Y BOTÓN DE ACCIÓN --- */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-red-500 tracking-tight">
                Productos (Admin)
              </h1>
            </div>

            <button
              onClick={() => { setProductoEditar(undefined); setMostrarFormulario(true); }}
              className="bg-[#1E1E24] hover:bg-[#E63946] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer focus:outline-none self-start sm:self-center"
            >
              Crear producto
            </button>
          </div>
          <FormularioProducto isOpen={mostrarFormulario} onClose={cerrarFormulario} productoEditar={productoEditar}/>

          {/* --- LISTADO DE TARJETAS HORIZONTALES (80% ancho) --- */}
          <div className="space-y-2.5">
            {productos.map((prod) => {
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl p-3.5 border border-gray-100/70 shadow-xs flex items-center justify-between gap-4 transition-all duration-200 hover:shadow-sm"
                >
                  {/* INFO IZQUIERDA */}
                  <div className="flex items-center space-x-4 min-w-0 flex-row">
                    <img
                      src={prod.imagen_url ?? "https://placeholder.com"}
                      alt={prod.nombre}
                      className='w-16 h-16 object-cover rounded-lg border border-gray-50 flex-shrink-0'
                    />

                    <div className="min-w-0">
                      <div className="flex items-baseline space-x-2">
                        <h3 className="text-sm font-extrabold text-[#1E1E24] leading-tight truncate">
                          {prod.nombre}
                        </h3>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${
                          prod.disponible ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'
                        }`}>
                          {prod.disponible ? 'Habilitado' : 'Oculto'}
                        </span>
                      </div>

                      {/* Detalles de Auditoría y Atributos Técnicos Solicitados */}
                      <div className="mt-1 space-y-0.5 text-[11px] font-medium text-stone-500">
                        <div className='flex items-center gap-1'>
                          <span>Precio base:</span>
                          <span className='font-bold text-stone-700'>${prod.precio.toFixed(2)}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <span>Descripción:</span>
                          <span className='font-normal text-stone-600 truncate max-w-xs md:max-w-md'>{prod.descripcion}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <span>Existencias en Stock:</span>
                          <span className={`font-semibold ${prod.stock_cantidad === 0 ? 'text-red-500' : 'text-stone-700'}`}>
                            {prod.stock_cantidad} unidades
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LADO DERECHO: ACCIONES DE ADMINISTRACIÓN */}
                  <div className="flex items-center space-x-2 flex-shrink-0">

                    {/* Editar */}
                    <button
                      onClick={() => { setProductoEditar(prod as any); setMostrarFormulario(true); }}
                      title="Editar producto"
                      className="bg-[#FFB703] hover:bg-[#1E1E24] text-[#1E1E24] hover:text-white p-1.5 rounded-lg transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none flex items-center justify-center"
                    >
                      <BsPencilSquare className="h-4 w-4" />
                    </button>

                    {/* Eliminar */}
                    <button
                      onClick={() => eliminar(prod)}
                      title="Eliminar del catálogo"
                      className="bg-gray-50 hover:bg-[#E63946] border border-gray-100/70 text-gray-400 hover:text-white p-1.5 rounded-lg transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none flex items-center justify-center"
                    >
                      <BsTrash className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              );
            })}

          </div>

        </div>
        </div>


    </>
  );
}
