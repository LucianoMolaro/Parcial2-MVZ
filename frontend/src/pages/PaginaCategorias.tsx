import { Fragment, useEffect, useState } from 'react';
import BarraNavegacion from '../components/Navbar';
import {  BsBoxArrowInRight, BsChevronRight, BsPencilSquare, BsPlus, BsPlusSquare, BsTrash } from 'react-icons/bs';
import FormularioCategoria from '../components/FormularioCategoria';
import { CategoriaRead } from '../models/Categoria';




export default function PaginaCategorias() {
  const [categoriasPrincipales, setCategoriasPrincipales] = useState<CategoriaRead[]>([]);
  const [categoriasAMostrar, setCategoriasAMostrar] = useState<CategoriaRead[]>([])
  const [historialNav, setHistorialNav] = useState<CategoriaRead[]>([]);

  const hayHistorial = historialNav.length > 0

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [categoriaEditar, setCategoriaEditar] = useState<CategoriaRead | null>(null)
  const [parentIdPreset, setParentIdPreset] = useState<number | null>(null)


  function cargarEstilo(cat?: CategoriaRead){
    return cat === historialNav[historialNav.length - 1] || historialNav.length == 0 
      ? 
      "text-red-400 border-none bg-none text-[18px] transition-all duration-300 ease-in-out" : 
      "text-gray-700 border-none bg-none text-[14px] hover:text-red-400 transition-all duration-300 ease-in-out";
  }

  const cargarCategoriasPrincipales = async () => {
    const res = await fetch('http://localhost:8000/categorias/admin', { credentials: 'include' });
    if (!res.ok) return
    const data: CategoriaRead[] = await res.json()
    setCategoriasPrincipales(data)
    setCategoriasAMostrar(data)
  };


  useEffect(() => { 
    if (categoriasPrincipales.length === 0) {
      cargarCategoriasPrincipales()
    }
  }, []);
  
  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setCategoriaEditar(null);
    setParentIdPreset(null)
    cargarCategoriasPrincipales();
    setCategoriasAMostrar([])
    setHistorialNav([])
  };

  const eliminar = async (cat: CategoriaRead) => {
    if (!confirm(`¿Eliminar "${cat.nombre}"?`)) return;
    const res = await fetch(`http://localhost:8000/categorias/${cat.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) cargarCategoriasPrincipales();
  };

  const entrarSub = (c: CategoriaRead) => {
    setHistorialNav(prevHistorial => [...prevHistorial, c])
    setCategoriasAMostrar(c.subcategorias)
  }

  const navegarAHistorial = (index: number) => {
    if (index === -1) {
      setHistorialNav([]);
      setCategoriasAMostrar(categoriasPrincipales);
      return;
    }
    const nuevoHistorial = historialNav.slice(0, index + 1);

    setHistorialNav(nuevoHistorial);
    const categoria = nuevoHistorial[nuevoHistorial.length - 1];

    setCategoriasAMostrar(categoria.subcategorias ?? categoriasPrincipales);
  };

  const abrirFormulario = (editar?: CategoriaRead) =>{
    if(!!editar) setCategoriaEditar(editar)
    setMostrarFormulario(true)
  }

  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-3 px-4 sm:px-6 lg:px-8 font-sans antialiased">
        <div className="w-4/5 mx-auto space-y-3">

          {/* --- ENCABEZADO Y BOTÓN DE ACCIÓN --- */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-extrabold text-red-500 tracking-tight ">
                Categorias
              </h1>
            </div>

            {/* Botón único de creación: Sabe dinámicamente si creará una raíz o una subcategoría */}
            <button
              onClick={() => {setMostrarFormulario(true)}}
              className="bg-[#1E1E24] hover:bg-[#E63946] flex items-center text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer focus:outline-none self-start sm:self-center"
            >
              Nueva
              <BsPlus className='w-5 h-5'></BsPlus>
            </button>

            <FormularioCategoria isOpen={mostrarFormulario} onClose={cerrarFormulario} categoriaEditar={categoriaEditar} ruta={historialNav} categorias={categoriasPrincipales}/>
          </div>

          {/* --- 🥖 MIGAS DE PAN (BREADCRUMBS) DINÁMICAS --- */}
          {/* Aparecen de forma sutil solo si el usuario se ha adentrado en los niveles */}
          <div className="flex flex-wrap items-center gap-x-1.5 text-[18px] font-semibold bg-white border border-gray-100 p-2 rounded-xl shadow-xs">
            <button
              onClick={()=>{navegarAHistorial(-1)}}
              className={cargarEstilo()} 
            >
              Principales
            </button>

            {historialNav.map((cat, index) => 
              <Fragment key={cat.id}>
                <BsChevronRight className='text-gray-600 w-5 h-5'></BsChevronRight>
                <button className={cargarEstilo(cat)} onClick={() => navegarAHistorial(index)}>
                {cat.nombre}
                </button>              
              </Fragment>)
            }
          </div>

          {/* --- GRID DE ELEMENTOS (Formato horizontal estirado y sutil) --- */}
          <div className="space-y-2.5 transition-all duration-100 ease-in-out antialiased">
              <div className="animate-in fade-in duration-500 space-y-3">
                {categoriasPrincipales.length === 0 && (
                  <div className="flex w-full justify-center py-6">
                    <span className="text-xs font-medium text-gray-400">
                      Aun no se han creado categorias...
                    </span>
                  </div>
                )}

                {hayHistorial && categoriasPrincipales.length > 0 && categoriasAMostrar.length === 0 && (
                  <div className="flex w-full justify-center py-6">
                    <span className="text-xs font-medium text-gray-400">
                      Aun no se han creado subcategorias...
                    </span>
                  </div>
                )}
                {categoriasAMostrar.map((cat) => {
                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-xl p-3.5 border border-gray-100/70 shadow-xs flex items-center justify-between gap-2 transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="flex items-center space-x-4 min-w-0 flex-col-2">
                      <img
                        src={cat.cloudinary.url ?? "https://via.placeholder.com/64"}
                        alt={cat.nombre}
                        className="w-16 h-16 rounded-md"
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
                            {cat.descripcion}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                    
                      <button
                        onClick={() => entrarSub(cat)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer bg-amber-50 border-amber-300 text-[#1E1E24] hover:bg-amber-400 hover:text-white"
                      >
                        <BsBoxArrowInRight className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setMostrarFormulario(true)}
                        title="Editar categoria"
                        className="bg-gray-50 border border-gray-100/70 flex items-center justify-center hover:bg-amber-400 text-stone-700 w-7 h-7 hover:text-white p-1.5 rounded-md transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer"
                      >
                        <BsPencilSquare className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => {setParentIdPreset(cat.id), setMostrarFormulario(true)}}
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
                })
                }

              </div>
          </div> 

        </div>
      </div>
    </>
  );
}
