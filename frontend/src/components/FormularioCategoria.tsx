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
    if(ruta.length>0){setCategoriasOption(ruta)}else{setCategoriasOption(categorias)}

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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

      {/* CONTENEDOR VENTANA MODAL (Sutil y compacta) */}
      <div className="relative w-full max-w-screen-sm bg-white rounded-2xl border border-gray-100 shadow-xl p-5 space-y-4 z-10 max-h-[90vh] overflow-y-auto scrollbar-hide">

        {/* Encabezado del modal */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-black text-[#1E1E24] tracking-tight ">
              {categoriaEditar ? 'Editar' : 'Nueva'} <span className="text-[#E63946]">Categoría</span>
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-[#E63946] font-black text-sm p-1 cursor-pointer"><BsXLg></BsXLg></button>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-3.5">
          {/* Nombre */}
          <div className="space-y-1">
            <label htmlFor="nombre" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre de categoria</label>
            <input
              id="nombre"
              type="text"
              required
              value={formulario.nombre}
              onChange={(e) => setFormulario({...formulario, nombre: e.target.value})}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label htmlFor="descripcion" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Descripción</label>
            <textarea
              id="descripcion"
              rows={2}
              value={formulario.descripcion}
              onChange={(e) => setFormulario({...formulario, descripcion: e.target.value})}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium resize-none leading-normal"
            />
          </div>
          

          {/* Ruta */} {/* Renderizado dinámico de los Selects en cascada */}
          <div className="relative space-y-1 bg-white border border-gray-100 p-2 rounded-xl shadow-xs">
            <label htmlFor="descripcion" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Categorias mayores
            </label>

            <button
              type="button"
              title='Eliminar categorias'
              className={`absolute top-1 right-2 p-1 rounded-md hover:bg-red-500 hover:text-white transition-all duration-200 ${
                !hayHistorial ? 'hidden' : ''
              }`}
              onClick={() => eliminarHistorial()}
            >
              <BsXLg className="w-4 h-4"/>
            </button>

            <div
              className={`flex flex-wrap items-center gap-x-1.5 text-[18px] font-semibold 
                ${!hayHistorial ? 'hidden' : ''}
              `}
            >
              {historialCategoria.map((cat, index) => (
                <Fragment key={cat.id}>
                  <button
                    className="text-gray-700 border-none bg-none text-[14px] hover:text-red-400 transition-all duration-300 ease-in-out"
                    onClick={() => navegarAHistorial(index)}
                  >
                    {cat.nombre}
                  </button>

                  <BsChevronRight className="text-gray-600 w-4 h-4" />

                  <span className="text-red-400 border-none bg-none text-[18px] transition-all duration-300 ease-in-out">
                    {formulario.nombre}
                  </span>
                </Fragment>
              ))}
            </div>

            <select
              name="parent_id"
              value={formulario.parent_id ?? ""}
              onChange={(e) => agregarCategoria(Number(e.target.value))}
              disabled={categoriasOption.length == 0}
            >
              <option value="">Subcategoria de...</option>
              {categoriasOption.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>


          {/* Subida de Imagen Sutil */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Imagen</label>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-gray-100 border-dashed flex items-center justify-center overflow-hidden">
                {!!imagen && <img src={URL.createObjectURL(imagen)} alt="Preview" className="w-full h-full object-cover" />}
              </div>
              <label className="bg-white border border-gray-200 hover:border-[#FFB703] text-gray-500 font-bold text-[11px] py-1.5 px-3 rounded-xl transition-all cursor-pointer shadow-xs active:scale-98">
                <span>Cargar Imagen</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {/* Botones de Acción de la Base */}
          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
                className="w-1/3 bg-gray-50 hover:bg-gray-100 text-[#1E1E24] border border-gray-100 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-2/3 bg-[#E63946] hover:bg-opacity-95 text-white font-extrabold text-xs py-2 rounded-xl tracking-wider uppercase transition-all shadow-xs active:scale-98 focus:outline-none cursor-pointer text-center"
            >
              Guardar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}