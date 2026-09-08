import { useState, useEffect, Fragment } from "react";
import { BsChevronRight, BsCircleFill, BsPlus, BsPlusLg, BsXLg } from "react-icons/bs";
import { cloudinary, ImagenProducto } from "../models/Cloudinary";
import { ProductoCreate, ProductoIngredienteCreate, ProductoCategoriaCreate } from "../models/Producto";
import { CategoriaRead } from "../models/Categoria";
import { IngredienteRead } from "../models/Ingrediente";
import { UnidadMedidaRead } from "../models/UnidadMedida";



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
    es_removible: false,
    unidad_medida_id: null as number | null 
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
  const [unidadesMedidaSelect, setUnidadesMedidaSelect] = useState<UnidadMedidaRead[]>([])
  const [previews, setPreviews] = useState<string[]>([]);
  const [mostrarImagenes, setMostrarImagenes] = useState(false);

  useEffect(() => {
    const urls = archivosImg.map(img => {
      if (img.file) {
        return URL.createObjectURL(img.file);
      }

      if (img.cloudinary) {
        return img.cloudinary.url;
      }

      return "";
    });

    setPreviews(urls);

    return () => {
      urls.forEach(url => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [archivosImg]);

  useEffect(()=>{
    if(categorias.length==0) cargarCategorias()
    if(ingredientes.length==0) cargarIngredientes() 
    if (productoEditar) {
      const imagenesExistentes: ImagenProducto[] =
        productoEditar.imagenes.map(p => ({
          cloudinary: p
        }));

      setArchivosImg(imagenesExistentes);
    }

  }, [])

  
  useEffect(()=>{
    if(formularioProdIngr.ingrediente_id == null) return
    let ingr = ingredientes.find(i => i.id == formularioProdIngr.ingrediente_id)
    if(!ingr) return
    cargarUnidadesPorTipo(ingr.unidad_medida.tipo)

  }, [formularioProdIngr])

  const cargarUnidadesPorTipo = async (tipo: string) => {
    const res = await fetch(`http://localhost:8000/unidades/medida/xtipo/${tipo}`, {method: "GET", credentials: "include"})
    if(!res.ok) return
    const data = await res.json()
    setUnidadesMedidaSelect(data)
  }

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
    if(formularioProdIngr.cantidad !=null && formularioProdIngr.ingrediente_id !=null && formularioProdIngr.unidad_medida_id !=null){
      let prodIngr: ProductoIngredienteCreate = {
        ingrediente_id: formularioProdIngr.ingrediente_id,
        cantidad: formularioProdIngr.cantidad,
        es_removible: formularioProdIngr.es_removible,
        unidad_medida_id: formularioProdIngr.unidad_medida_id
      }
      setProdIngr(prev => [...prev, prodIngr])
    }  
  }

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
      {/* Fondo con blur */}
      <div
        className="absolute inset-0 z-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md space-y-4 overflow-y-auto scrollbar-hide rounded-2xl border border-gray-100 bg-white p-5 font-sans antialiased shadow-xl max-h-[90vh]">

        {/* Cabecera */}
        <div className="flex items-start justify-between border-b border-gray-50 pb-2">
          <h2 className="text-base font-black tracking-tight text-[#1E1E24]">
            {productoEditar ? "Editar" : "Nuevo"} <span className="text-[#E63946]">Producto</span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="cursor-pointer p-1 text-sm font-black text-gray-400 transition-colors hover:text-[#E63946]"
          >
            <BsXLg />
          </button>
        </div>

        <form className="space-y-3.5" onSubmit={handleSubmit}>

          {/* Nombre y Precio */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Nombre
              </label>
              <input
                type="text"
                required
                value={formularioProducto.nombre}
                onChange={(e) => setFormularioProducto({ ...formularioProducto, nombre: e.target.value })}
                className="w-full rounded-xl border border-gray-100 bg-[#FAFAFA] px-2.5 py-1.5 text-xs font-medium text-[#1E1E24] focus:outline-none focus:border-[#FFB703]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Precio ($)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formularioProducto.precio}
                onChange={(e) => setFormularioProducto({ ...formularioProducto, precio: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-100 bg-[#FAFAFA] px-2.5 py-1.5 text-xs font-medium text-[#1E1E24] focus:outline-none focus:border-[#FFB703]"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Descripción
            </label>
            <textarea
              rows={2}
              value={formularioProducto.descripcion}
              onChange={(e) => setFormularioProducto({ ...formularioProducto, descripcion: e.target.value })}
              className="w-full resize-none rounded-xl border border-gray-100 bg-[#FAFAFA] px-2.5 py-1.5 text-xs font-medium text-[#1E1E24] focus:outline-none focus:border-[#FFB703]"
            />
          </div>

          {/* ================= RELACIÓN: PRODUCTO - CATEGORÍA ================= */}
          <div className="space-y-2 rounded-xl border border-gray-100/40 bg-[#FAFAFA] p-2.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Enlazar Categorías
            </label>

            {historialNav && (
              <div className="flex items-center gap-1 flex-wrap">
                {historialNav.map((c) => (
                  <Fragment key={c.id}>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={categoriaPrincipal === c.id}
                        onChange={() =>
                          setCategoriaPrincipal(categoriaPrincipal === c.id ? null : c.id)
                        }
                        className="accent-[#FFB703]"
                      />
                      <span className="text-xs font-medium text-[#1E1E24]">{c.nombre}</span>
                    </label>
                    <BsChevronRight className="text-gray-300" />
                  </Fragment>
                ))}
              </div>
            )}

            <select
              onChange={(e) => {
                agregarCat(Number(e.target.value));
                agregarAHistorial(Number(e.target.value));
              }}
              className="w-full cursor-pointer rounded-xl border border-gray-100 bg-white px-2 py-1.5 text-xs font-medium text-[#1E1E24] focus:outline-none"
            >
              <option value="">Selecciona una categoría...</option>
              {categoriasOption.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* ================= INGREDIENTES ================= */}
          <div className="space-y-2 rounded-xl border border-gray-100/40 bg-[#FAFAFA] p-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Ingredientes
              </label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={esfinal}
                    onClick={() => setEsfinal(!esfinal)}
                    className={`relative h-5 w-9 rounded-full transition-colors duration-200 ease-in-out
                      ${esfinal ? "bg-[#FFB703]" : "bg-gray-200"}
                    `}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ease-in-out
                        ${esfinal ? "translate-x-4" : "translate-x-0"}
                      `}
                    />
                  </button>
            </div>

            <div className={`${esfinal ? "hidden" : "flex"} flex-col gap-2`}>
              {/* Fila: Ingrediente + Cantidad + Unidad */}
              <div className="flex gap-2">
                <select
                  onChange={(e) => setFormularioProdIngr({ ...formularioProdIngr, ingrediente_id: Number(e.target.value) })}
                  className="flex-grow cursor-pointer rounded-xl border border-gray-100 bg-white px-2 py-1.5 text-xs font-medium text-[#1E1E24] focus:outline-none"
                >
                  <option value="">Selecciona un ingrediente...</option>
                  {ingredientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>

                <input
                  type="number"
                  step="0.1"
                  placeholder="Cantidad"
                  onChange={(e) => setFormularioProdIngr({ ...formularioProdIngr, cantidad: Number(e.target.value) })}
                  className="w-16 rounded-xl border border-gray-100 bg-white px-2 py-1.5 text-xs font-medium text-[#1E1E24] focus:outline-none"
                />

                <select
                  onChange={(e) => setFormularioProdIngr({ ...formularioProdIngr, unidad_medida_id: Number(e.target.value) })}
                  className="w-20 cursor-pointer rounded-xl border border-gray-100 bg-white px-2 py-1.5 text-xs font-medium text-[#1E1E24] focus:outline-none"
                  disabled={unidadesMedidaSelect.length==0}
                >
                  <option
                    value=""
                    className={formularioProdIngr.ingrediente_id !== null ? "hidden" : ""}
                  >
                    tipo...
                  </option>
                  {unidadesMedidaSelect.map(u => (
                    <option value={u.id} key={u.id}>{u.simbolo}</option>
                  ))}
                </select>
              </div>

              {/* Switch: Removible + Botón agregar */}
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Removible
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formularioProdIngr.es_removible}
                    onClick={() => setFormularioProdIngr({ ...formularioProdIngr, es_removible: !formularioProdIngr.es_removible })}
                    className={`relative h-5 w-9 rounded-full transition-colors duration-200 ease-in-out
                      ${formularioProdIngr.es_removible ? "bg-[#FFB703]" : "bg-gray-200"}
                    `}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ease-in-out
                        ${formularioProdIngr.es_removible ? "translate-x-4" : "translate-x-0"}
                      `}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => agregarIngr()}
                    aria-label="Agregar ingrediente"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E1E24] text-white transition-transform active:scale-90"
                  >
                    <BsPlusLg className="text-[10px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= IMAGEN ================= */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Imagen
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative">
                {/* Preview acumulada */}
                <button
                  type="button"
                  onClick={() => setMostrarImagenes((prev) => !prev)}
                  className="relative h-10 w-10 overflow-hidden rounded-xl border border-dashed border-gray-100 bg-[#FAFAFA]"
                >
                  {previews.slice(0, 3).map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      className={`absolute h-7 w-7 rounded-lg border-2 border-white object-cover
                        ${index === 0 ? "-translate-x-1 -translate-y-1" : ""}
                        ${index === 1 ? "translate-x-1" : ""}
                        ${index === 2 ? "translate-y-1" : ""}
                      `}
                    />
                  ))}

                  {previews.length > 3 && (
                    <span className="absolute bottom-0 right-0 z-10 rounded-md bg-black/70 px-1 text-[9px] text-white">
                      +{previews.length - 3}
                    </span>
                  )}
                </button>

                {/* Lista para eliminar */}
                {mostrarImagenes && (
                  <div className="absolute left-0 top-12 z-50 w-64 rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
                    <div className="grid grid-cols-3 gap-2">
                      {archivosImg.map((imagen, index) => (
                        <div key={index} className="relative">
                          <img
                            src={obtenerImagen(imagen)}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setArchivosImg((prev) => prev.filter((_, i) => i !== index))
                            }
                            aria-label="Eliminar imagen"
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E63946] text-xs text-white"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <label className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-500 shadow-xs transition-all hover:border-[#FFB703] active:scale-98">
                <span>Cargar Imagen</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files) return;

                    const nuevasImagenes: ImagenProducto[] = Array.from(files).map((file) => ({ file }));
                    setArchivosImg((prev) => [...prev, ...nuevasImagenes]);
                  }}
                />
              </label>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}