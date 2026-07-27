import React, { useEffect, useState } from 'react';
import BarraNavegacion from '../components/Navbar';
import {  BsBoxArrowInRight, BsChevronCompactRight, BsPencilSquare, BsPlusSquare, BsTrash } from 'react-icons/bs';
import FormularioCategoria from '../components/FormularioCategoria';
import { Categoria } from '../models/Categoria';



export default function PaginaCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [historialNav, setHistorialNav] = useState<Categoria[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState<Categoria | undefined>(undefined);
  const [parentIdPreset, setParentIdPreset] = useState<number | undefined>(undefined);

  const cargarCategorias = async () => {
    const res = await fetch('http://localhost:8000/categorias/', { credentials: 'include' });
    if (res.ok) setCategorias(await res.json());
  };

  useEffect(() => { cargarCategorias(); }, []);

  const esRaiz = historialNav.length === 0;

  const categoriaActual = esRaiz
    ? null
    : categorias.find(c => c.id === historialNav[historialNav.length - 1].id) ?? null;

  const listasVisibles = esRaiz
    ? categorias.filter(c => c.parent_id === null)
    : categoriaActual?.subcategorias ?? [];

    const entrarASubcategoria = (cat: Categoria) => {
      if (cat.subcategorias && cat.subcategorias.length > 0) {
        setHistorialNav(prev => [...prev, cat]);
      } else {
        alert(`"${cat.nombre}" es el último nivel. No tiene más subcategorías internas.`);
      }
    };

  const regresarANivel = (index: number) => {
    if (index === -1) {
      setHistorialNav([]);
    } else {
      setHistorialNav(prev => prev.slice(0, index + 1));
    }
  };

  const abrirCrear = () => {
    setCategoriaEditar(undefined);
    setParentIdPreset(categoriaActual?.id);
    setMostrarFormulario(true);
  };

  const abrirEditar = (cat: Categoria) => {
    setCategoriaEditar(cat);
    setParentIdPreset(undefined);
    setMostrarFormulario(true);
  };

  const abrirSubcategoria = (cat: Categoria) => {
    setCategoriaEditar(undefined);
    setParentIdPreset(cat.id);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setCategoriaEditar(undefined);
    setParentIdPreset(undefined);
    cargarCategorias();
  };

  const eliminar = async (cat: Categoria) => {
    if (!confirm(`¿Eliminar "${cat.nombre}"?`)) return;
    const res = await fetch(`http://localhost:8000/categorias/${cat.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) cargarCategorias();
  };

  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
        <div className="w-4/5 mx-auto space-y-6">

          {/* --- ENCABEZADO Y BOTÓN DE ACCIÓN --- */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-red-500 tracking-tight">
                Categorias
              </h1>
            </div>

            {/* Botón único de creación: Sabe dinámicamente si creará una raíz o una subcategoría */}
            <button
              onClick={abrirCrear}
              className="bg-[#1E1E24] hover:bg-[#E63946] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer focus:outline-none self-start sm:self-center"
            >
              Crear categoria
            </button>

            {mostrarFormulario && (
              <FormularioCategoria
                isOpen={mostrarFormulario}
                onClose={cerrarFormulario}
                categoriaEditar={categoriaEditar}
                parentIdPreset={parentIdPreset}
              />
            )}
          </div>

          {/* --- 🥖 MIGAS DE PAN (BREADCRUMBS) DINÁMICAS --- */}
          {/* Aparecen de forma sutil solo si el usuario se ha adentrado en los niveles */}
          <div className="flex flex-wrap items-center gap-x-1.5 text-xs font-semibold bg-white border border-gray-100 p-2.5 rounded-xl shadow-xs">
            <button
              onClick={() => regresarANivel(-1)}
              className={`hover:text-red-400 transition-colors ${esRaiz ? 'text-red-400' : 'text-stone-500'}`}
            >
              Principales
            </button>

            {historialNav.map((cat, index) => {
              const esUltimo = index === historialNav.length - 1;
              return (
                <React.Fragment key={cat.id}>
                  <BsChevronCompactRight className='text-stone-500 h-3.5 w-3.5'/>
                  <button
                    disabled={esUltimo}
                    onClick={() => regresarANivel(index)}
                    className={`transition-colors ${esUltimo ? 'text-red-400 font-black cursor-default' : 'text-stone-500 hover:text-red-400'}`}
                  >
                    {cat.nombre}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* --- GRID DE ELEMENTOS (Formato horizontal estirado y sutil) --- */}
          <div className="space-y-2.5">
            {listasVisibles.map((cat) => {
              const tieneHijos = cat.subcategorias && cat.subcategorias.length > 0;

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-xl p-3.5 border border-gray-100/70 shadow-xs flex items-center justify-between gap-2 transition-all duration-200 hover:shadow-sm"
                >
                  {/* Info izquierda */}
                  <div className="flex items-center space-x-4 min-w-0 flex-col-2">
                    <img
                      src={cat.imagen_url ?? "https://via.placeholder.com/64"}
                      alt={cat.nombre}
                      className="w-16 h-16"
                    />

                    <div className="min-w-0 w-11/12">
                      <div className="flex items-center gap-2">
                        <h3 className="text-s font-extrabold text-[#1E1E24] leading-tight truncate">
                          {cat.nombre}
                        </h3>

                        {cat.habilitado ? (
                          <span className="text-[9px] font-bold bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            Habilitada
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            Deshabilitada
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-stone-500 font-medium">
                          Descripción:
                        </p>
                        <span className="font-semibold text-[11px] text-stone-700">
                          {cat.descripcion || "-"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-stone-500 font-medium">
                          Subcategorías:
                        </p>
                        <span className="font-semibold text-[11px] text-stone-700">
                          {cat.subcategorias.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones derecha */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {tieneHijos && (
                      <button
                        onClick={() => entrarASubcategoria(cat)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer bg-amber-50 border-amber-300 text-[#1E1E24] hover:bg-amber-400 hover:text-white"
                      >
                        <BsBoxArrowInRight className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => abrirEditar(cat)}
                      title="Editar categoria"
                      className="bg-gray-50 border border-gray-100/70 flex items-center justify-center hover:bg-amber-400 text-stone-700 w-7 h-7 hover:text-white p-1.5 rounded-md transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer"
                    >
                      <BsPencilSquare className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => abrirSubcategoria(cat)}
                      title="Agregar subcategoria"
                      className="bg-gray-50 hover:bg-green-500 border w-7 h-7 border-gray-100/70 text-stone-700 hover:text-white p-1.5 rounded-md transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer"
                    >
                      <BsPlusSquare className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => eliminar(cat)}
                      title="Eliminar categoria"
                      className="bg-gray-50 hover:bg-red-500 border w-7 h-7 border-gray-100/70 text-stone-700 hover:text-white p-1.5 rounded-md transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer"
                    >
                      <BsTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {listasVisibles.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100/60 p-8 text-center text-xs font-medium text-gray-400">
                Esta sección no tiene subramas creadas aún.
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
