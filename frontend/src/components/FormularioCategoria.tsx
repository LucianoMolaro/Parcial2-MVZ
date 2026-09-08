import React, { Fragment, JSXElementConstructor, ReactDOM, ReactElement, ReactEventHandler, ReactNode, useEffect, useState } from 'react';
import { CategoriaCreate, CategoriaRead } from '../models/Categoria';
import { cloudinary } from '../models/Cloudinary';
import { BsChevronRight, BsXLg, BsXSquare } from 'react-icons/bs';

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  categoriaEditar: CategoriaRead | null
  // parentPreset: CategoriaRead | null
  ruta: CategoriaRead[]
  categorias: CategoriaRead[]
}

export default function FormularioCategoria({ isOpen, onClose, categoriaEditar, ruta, categorias }: ModalProps) {

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "", 
    parent_id: null as number | null,

  })
  const [categoriasOption, setCategoriasOption] = useState<CategoriaRead[]>([])
  const [original, setOriginal] = useState<CategoriaRead | null>(null)
  const [imagen, setImagen] = useState<File | null>(null);
  const [cloudinary, setCloudinary] = useState<cloudinary | null>(null)

  const [categoriasPrincipales, setCategorias] = useState<CategoriaRead[]>([]);
  const [historialCategoria, setHistorialCategoria] = useState<CategoriaRead[]>([])
  const hayHistorial = historialCategoria.length > 0


  useEffect(()=>{
    if(!isOpen) return

    setHistorialCategoria(ruta)
    setCategorias(categorias)
    if(ruta.length>0){setCategoriasOption(ruta[ruta.length - 1].subcategorias)}else{setCategoriasOption(categorias)}

    if(!!categoriaEditar){
      setOriginal(categoriaEditar)
      setFormulario({
        nombre: categoriaEditar.nombre,
        descripcion: categoriaEditar.descripcion,
        parent_id: categoriaEditar.parent_id ?? null,
      })
      setCloudinary(categoriaEditar.cloudinary)
      if(ruta.length > 0) {
        setFormulario({...formulario, parent_id: ruta[ruta.length - 1].id})
        // cargarRuta(parentIdPreset)
        // obtenerCategoria()
      }
    }
  }, [isOpen])

  useEffect(()=>{

    console.log(formulario)
  }, [formulario])

  const borrarUnaImagen = async (publicId: string): Promise<void> => {
    const resp = await fetch(`http://localhost:8000/cloudinary/delete/${publicId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!resp.ok) {
      throw new Error(`Error al borrar imagen: ${resp.status}`);
    }
    const data: { ok: boolean; detail: string } = await resp.json();
    if (!data.ok) throw new Error("El servidor indicó que el borrado falló");
  };

  const subirUnaImagen = async (archivo: File) => {
        const formData = new FormData();
        formData.append("file", archivo);
        formData.append("folder", "prueba");
    
        const resp = await fetch("http://localhost:8000/cloudinary/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
    
        if (!resp.ok) throw new Error(`Error al subir: ${resp.status}`);
    
        return await resp.json();
        
      };
    
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setImagen(archivo)
  }
  
  const navegarAHistorial = (index: number) => {
    if (index === -1) {
      setHistorialCategoria([]);
      setCategoriasOption(categoriasPrincipales);
      return;
    }
    const nuevoHistorial = historialCategoria.slice(0, index + 1);

    setHistorialCategoria(nuevoHistorial);
    const categoria = nuevoHistorial[nuevoHistorial.length - 1];

    setCategoriasOption(categoria.subcategorias ?? categoriasPrincipales);
  };

  const agregarCategoria = (id: number) => {
    const cat = categoriasOption.find(c => c.id == id)
    if(!cat) return

    setFormulario({...formulario, parent_id: id})
    setHistorialCategoria(prev => [...prev, cat])
    setCategoriasOption(cat.subcategorias ?? [])
  }

  const eliminarHistorial = () => {
    setHistorialCategoria([])
    setFormulario({...formulario, parent_id: null})
    setCategoriasOption(categoriasPrincipales)
  }
 
  const limpiarFormulario = ()=>{
    setFormulario({
      nombre: "",
      descripcion: "", 
      parent_id: null,
    })
    setImagen(null)
    onClose();
  }


const manejarEnvio = async (e: React.FormEvent) => {
  e.preventDefault();

  let imagenSubida = cloudinary;

  if (imagen) {
    imagenSubida = await subirUnaImagen(imagen);

    if (categoriaEditar) {
      await borrarUnaImagen(categoriaEditar.cloudinary.public_id);
    }
  }

  if (!imagenSubida) {
    return;
  }

  const datos: CategoriaCreate = {
    ...formulario,
    cloudinary: imagenSubida
  };

  if (categoriaEditar) {

    if (
      original &&
      original.nombre === formulario.nombre &&
      original.descripcion === formulario.descripcion &&
      original.parent_id === formulario.parent_id
    ) {
      onClose();
      return;
    }

    const res = await fetch(
      `http://localhost:8000/categorias/${categoriaEditar.id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      }
    );

    if (res.ok) {
      limpiarFormulario();
    }

  } else {

    const res = await fetch(
      "http://localhost:8000/categorias/crear",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      }
    );

    if (res.ok) {
      limpiarFormulario();
    }
  }
};
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* CAPA DE DESENFOQUE OSCURA (Backdrop) */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* CONTENEDOR VENTANA MODAL */}
      <div className="relative z-10 w-full max-w-screen-sm space-y-4 overflow-y-auto scrollbar-hide rounded-2xl border border-gray-100 bg-white p-5 shadow-xl max-h-[90vh] font-sans antialiased">

        {/* Encabezado */}
        <div className="flex items-start justify-between border-b border-gray-50 pb-2">
          <h2 className="text-base font-black tracking-tight text-[#1E1E24]">
            {categoriaEditar ? "Editar" : "Nueva"} <span className="text-[#E63946]">Categoría</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="cursor-pointer p-1 text-sm font-black text-gray-400 transition-colors hover:text-[#E63946]"
          >
            <BsXLg />
          </button>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-3.5">

          {/* Nombre */}
          <div className="space-y-1">
            <label htmlFor="nombre" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Nombre de categoria
            </label>
            <input
              id="nombre"
              type="text"
              required
              value={formulario.nombre}
              onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
              className="w-full rounded-xl border border-gray-100 bg-[#FAFAFA] px-2.5 py-1.5 text-xs font-medium text-[#1E1E24] placeholder-gray-400 transition-colors focus:outline-none focus:border-[#FFB703]"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label htmlFor="descripcion" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Descripción
            </label>
            <textarea
              id="descripcion"
              rows={2}
              value={formulario.descripcion}
              onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
              className="w-full resize-none rounded-xl border border-gray-100 bg-[#FAFAFA] px-2.5 py-1.5 text-xs font-medium leading-normal text-[#1E1E24] placeholder-gray-400 transition-colors focus:outline-none focus:border-[#FFB703]"
            />
          </div>

          {/* Ruta / Categorías en cascada */}
          <div className="relative space-y-2 rounded-xl border border-gray-100 bg-[#FAFAFA] p-2.5 shadow-xs">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Categorias mayores
            </label>

            <button
              type="button"
              title="Eliminar categorias"
              className={`absolute right-2 top-2 rounded-md p-1 text-gray-400 transition-all duration-200 hover:bg-[#E63946] hover:text-white ${
                !hayHistorial ? "hidden" : ""
              }`}
              onClick={() => eliminarHistorial()}
            >
              <BsXLg className="h-3.5 w-3.5" />
            </button>

            <div
              className={`flex flex-wrap items-center gap-x-1.5 ${!hayHistorial ? "hidden" : ""}`}
            >
              {historialCategoria.map((cat, index) => (
                <Fragment key={cat.id}>
                  <button
                    type="button"
                    className="border-none bg-none text-xs font-semibold text-gray-500 transition-all duration-300 ease-in-out hover:text-[#E63946]"
                    onClick={() => navegarAHistorial(index)}
                  >
                    {cat.nombre}
                  </button>

                  <BsChevronRight className="h-3 w-3 text-gray-300" />

                  {index === historialCategoria.length - 1 && (
                    <span className="border-none bg-none text-xs font-semibold text-[#E63946] transition-all duration-300 ease-in-out">
                      {formulario.nombre}
                    </span>
                  )}
                </Fragment>
              ))}
            </div>

            <select
              name="parent_id"
              value={formulario.parent_id ?? ""}
              onChange={(e) => agregarCategoria(Number(e.target.value))}
              disabled={categoriasOption.length == 0}
              className="w-full cursor-pointer rounded-xl border border-gray-100 bg-white px-2 py-1.5 text-xs font-medium text-[#1E1E24] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Subcategoria de...</option>
              {categoriasOption.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Imagen */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Imagen
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-100 bg-[#FAFAFA]">
                {!!imagen && (
                  <img src={URL.createObjectURL(imagen)} alt="Preview" className="h-full w-full object-cover" />
                )}
              </div>
              <label className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-500 shadow-xs transition-all hover:border-[#FFB703] active:scale-98">
                <span>Cargar Imagen</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 cursor-pointer rounded-xl border border-gray-100 bg-gray-50 py-2 text-center text-xs font-bold text-[#1E1E24] transition-all hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-2/3 cursor-pointer rounded-xl bg-[#E63946] py-2 text-center text-xs font-extrabold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-opacity-95 focus:outline-none active:scale-98"
            >
              Guardar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}