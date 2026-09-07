import { useState, useEffect, Fragment } from "react";
import { BsChevronRight, BsCircleFill, BsPlus, BsXLg } from "react-icons/bs";
import { cloudinary, ImagenProducto } from "../models/Cloudinary";
import { ProductoCreate, ProductoIngredienteCreate, ProductoCategoriaCreate } from "../models/Producto";
import { CategoriaRead } from "../models/Categoria";
import { IngredienteRead } from "../models/Ingrediente";



interface ModalProps{
  isOpen: boolean,
  onClose: () => void, 
  productoEditar: ProductoCreate | null
}

export default function ModalNuevoProducto({ isOpen, onClose, productoEditar }: ModalProps) {
  const [formularioProducto, setFormularioProducto] = useState({
    nombre: "",
    precio: 0,
    descripcion: "", 
  })
  const [formularioProdIngr, setFormularioProdIngr] = useState({
    ingrediente_id: null as number | null,
    cantidad: null as number | null,
    es_removible: false
  })
  const [formularioProdCat, setFormularioProdCat] = useState<number[]>([])

  const [archivosImg, setArchivosImg] = useState<ImagenProducto[]>([])

  const [productoIngrediente, setProdIngr] = useState<ProductoIngredienteCreate[]>([])
  const [esfinal, setEsfinal] = useState(false)


  const [categorias, setCategorias] = useState<CategoriaRead[]>([])
  const [categoriasOption, setCategoriasOption] = useState<CategoriaRead[]>([])
  const [historialNav, setHistorial] = useState<CategoriaRead[]>([])
  const [categoriaPrincipal, setCategoriaPrincipal] = useState<number | null>(null)
  const [ingredientes, setIngredientes] = useState<IngredienteRead[]>([])
  const [previews, setPreviews] = useState<string[]>([]);
  const [mostrarImagenes, setMostrarImagenes] = useState(false);

  useEffect(() => {
    const urls = archivosImg.map(img => URL.createObjectURL(img));

    setPreviews(urls);

    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [archivosImg]);

  useEffect(()=>{
    if(categorias.length==0) cargarCategorias()
    if(ingredientes.length==0) cargarIngredientes() 
    if(productoEditar){
      let imagen: ImagenProducto = {cloudinary: productoEditar.imagenes}
      setArchivosImg(prev => [...prev, imagen])
    }

  }, [])

  // useEffect(() => {
  //   console.log("categorias:", categorias);
  //   setCategoriasOption(categorias);
  // }, [categorias]);

  const agregarCat = (id: number) => {
    setFormularioProdCat(prev => [...prev, id])
  }

  // useEffect(()=>{
  //   console.log(formularioProdCat)
  //   console.log(categoriaPrincipal)
  // },[formularioProdCat, categoriaPrincipal])

  const agregarAHistorial = (id:  number) => {
    if(id != null){
      let cat = categoriasOption.find(c => c.id == id)
      if (!cat) return
      
      setHistorial(prev => {
        // Si ya está, no la agregamos nuevamente
        if (prev.some(c => c.id === cat.id)) {
          return prev
        }

        return [...prev, cat]
      })
    
      setCategoriasOption(cat.subcategorias ?? [])
    }
  }

  const agregarIngr = () => {
    if(!!formularioProdIngr.cantidad && formularioProdIngr.ingrediente_id){
      let prodIngr: ProductoIngredienteCreate = {
        ingrediente_id: formularioProdIngr.ingrediente_id,
        cantidad: formularioProdIngr.cantidad,
        es_removible: formularioProdIngr.es_removible
      }
      setProdIngr(prev => [...prev, prodIngr])
    }  
  }

  useEffect(()=>{
    agregarIngr()
    console.log(formularioProdIngr)
  }, [formularioProdIngr])

  const cargarCategorias = async () => {
    const res = await fetch('http://localhost:8000/categorias/admin', { credentials: 'include' });
    if (!res.ok) return;
    const data: CategoriaRead[] = await res.json()
    setCategorias(data)
    setCategoriasOption(data)
  };

  const cargarIngredientes = async () => {
    const res = await fetch('http://localhost:8000/ingredientes/todos', { credentials: 'include' });
    if (res.ok) setIngredientes(await res.json());
  };

  const obtenerImagen = (imagen: ImagenProducto): string => {
    if (imagen.file) {
      return URL.createObjectURL(imagen.file);
    }

    if (imagen.cloudinary) {
      return imagen.cloudinary.url;
    }

    return "";
  };


  const handleSubmit = async() => {

  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Capa de desenfoque de fondo */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs z-0"
        onClick={onClose}
      />

      {/* Ventana Modal (Configurada con scroll vertical interno sutil) */}
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl p-5 space-y-4 z-10 max-h-[90vh] overflow-y-auto scrollbar-hide font-sans antialiased">

        {/* Cabecera */}
        <div className="flex items-start justify-between border-b border-gray-50 pb-2">
          <div>
            <h2 className="text-base font-black text-[#1E1E24] tracking-tight">
              {productoEditar ? 'Editar' : 'Nuevo'} <span className="text-[#E63946]">Producto</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#E63946] font-black text-sm p-1 cursor-pointer"><BsXLg></BsXLg></button>
        </div>

        <form className="space-y-3.5" onSubmit={handleSubmit}>

          {/* Fila Doble: Nombre y Precio */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre</label>
              <input type="text" required value={formularioProducto.nombre} onChange={e => setFormularioProducto({...formularioProducto, nombre: e.target.value})} className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] font-medium" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Precio ($)</label>
              <input type="number" step="0.1" required value={formularioProducto.precio} onChange={e=>setFormularioProducto({...formularioProducto, precio: Number(e.target.value)})} className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] font-medium" />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Descripción</label>
            <textarea rows={2} value={formularioProducto.descripcion} onChange={(e) => setFormularioProducto({...formularioProducto, descripcion: e.target.value})} className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] font-medium resize-none" />
          </div>

          {/* ========================================================================= */}
          {/* RELACIÓN 1: PRODUCTO - CATEGORÍA (Muchos a Muchos, recursivo) */}
          {/* ========================================================================= */}
          <div className="space-y-2 bg-[#FAFAFA] p-2.5 rounded-xl border border-gray-100/40">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Enlazar Categorías
            </label>

            {historialNav && (
              <div className="flex gap-1 items-center">
                {historialNav.map(c => (
                  <Fragment key={c.id}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={categoriaPrincipal === c.id}
                        onChange={() =>
                          setCategoriaPrincipal(
                            categoriaPrincipal === c.id ? null : c.id
                          )
                        }
                      />
                      <span className="text-xs">{c.nombre}</span>
                    </div>
                    <BsChevronRight />
                  </Fragment>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <select
                onChange={(e) => {agregarCat(Number(e.target.value)), agregarAHistorial(Number(e.target.value))}}
                className="flex-grow px-2 py-1.5 text-xs bg-white border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none font-medium cursor-pointer"
              >
                <option value="">Selecciona una categoría...</option>
                {categoriasOption.map(c => (
                  <option key={c.id} value={c.id} className="rounded-md">{c.nombre}</option>
                ))}
                       
              </select> 
            </div>
          </div>

          

          <div className={"space-y-2 bg-[#FAFAFA] p-2.5 rounded-xl border border-gray-100/40 "} >
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Ingredientes
            </label>
              <button
                type="button"
                onClick={(e) => {setEsfinal(!esfinal)}}
              >
                <BsCircleFill></BsCircleFill>  
              </button> 

            <div className={esfinal ? "hidden" : "block" + " flex gap-2"}>

              <select
                onChange={(e) => {setFormularioProdIngr({...formularioProdIngr, ingrediente_id: Number(e.target.value)})}}
                className="flex-grow px-2 py-1.5 text-xs bg-white border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none font-medium cursor-pointer"
              >
                <option value="">Selecciona una categoría...</option>
                {ingredientes.map(c => (
                  <option key={c.id} value={c.id} className="rounded-md">{c.nombre}</option>
                ))}
                       
              </select>
              <input 
                type="number"
                step="0.1" 
                onChange={(e) => {setFormularioProdIngr({...formularioProdIngr, cantidad: Number(e.target.value)})}} 
              />

              <button
                type="button"
                onClick={() => setFormularioProdIngr({...formularioProdIngr, es_removible: (!formularioProdIngr.es_removible)})}
              >
                <BsCircleFill></BsCircleFill>  
              </button> 
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Imagen</label>
            <div className="flex items-center space-x-2">
              <div className="relative w-10 h-10 rounded-xl bg-[#FAFAFA] border border-gray-100 border-dashed flex items-center justify-center overflow-hidden">
                {previews.length > 0 && (
                  <>
                    {previews.slice(0, 3).map((src, index) => (
                      <img
                        key={src}
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className={`absolute w-7 h-7 rounded-lg object-cover border-2 border-white shadow-sm ${
                          index === 0
                            ? "-translate-x-1 -translate-y-1"
                            : index === 1
                            ? "translate-x-1"
                            : "translate-y-1"
                        }`}
                      />
                    ))}

                    {previews.length > 3 && (
                      <span className="absolute bottom-0 right-0 z-10 bg-black/70 text-white text-[9px] font-medium rounded-md px-1">
                        +{previews.length - 3}
                      </span>
                    )}
                  </>
                )}
              </div>
              <label className="bg-white border border-gray-200 hover:border-[#FFB703] text-gray-500 font-bold text-[11px] py-1.5 px-3 rounded-xl transition-all cursor-pointer shadow-xs active:scale-98">
                <span>Cargar Imagen</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;

                    if (!files) return;

                    setArchivosImg(prev => [
                      ...prev,
                      ...Array.from(files)
                    ]);
                  }}
                />
              </label>
            </div>
          </div>
          <div className="relative">

          {/* Preview acumulada */}
          <button
            type="button"
            onClick={() => setMostrarImagenes(prev => !prev)}
            className="relative w-10 h-10 rounded-xl bg-[#FAFAFA] border border-gray-100 border-dashed overflow-hidden"
          >
            {previews.slice(0, 3).map((src, index) => (
              <img
                key={src}
                src={src}
                className={`absolute w-7 h-7 rounded-lg object-cover border-2 border-white
                  ${index === 0 ? "-translate-x-1 -translate-y-1" : ""}
                  ${index === 1 ? "translate-x-1" : ""}
                  ${index === 2 ? "translate-y-1" : ""}
                `}
              />
            ))}

            {previews.length > 3 && (
              <span className="absolute bottom-0 right-0 z-10 bg-black/70 text-white text-[9px] rounded-md px-1">
                +{previews.length - 3}
              </span>
            )}
          </button>

          {/* Lista para eliminar */}
          {mostrarImagenes && (
            <div className="absolute top-12 left-0 z-50 w-64 p-2 bg-white border rounded-xl shadow-lg">
              <div className="grid grid-cols-3 gap-2">
                {archivosImg.map((imagen, index) => (
                  <div key={index} className="relative">
                    <img
                      src={obtenerPreview(imagen)}
                      className="w-16 h-16 rounded-lg object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setArchivosImg(prev =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>       


        </form>
      </div>
    </div>
  );
}