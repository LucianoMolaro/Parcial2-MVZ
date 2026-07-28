import { useState, useEffect } from "react";
import { BsPlus } from "react-icons/bs";
import { Producto } from "../models/Producto";
import { cloudinary } from "../models/Cloudinary";
import { Categoria } from "../models/Categoria";
import { Ingrediente } from "../models/Ingrediente";
import { ProductoIngredienteRead } from "../models/ProductoIngrediente";

// Ajustá estas rutas de import a donde realmente tengas cada archivo en tu proyecto


// Selección de categoría en construcción (camino padre -> hijo + cuál es la principal)
type CategoriaSeleccionada = {
  categoriaId: number;
  nombre: string;
  principal: boolean;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productoEditar?: Producto | null;
};

// La sesión viaja por cookie (httpOnly) + AuthContext, no por localStorage.
// Por eso alcanza con mandar credentials: "include" en cada fetch protegido.
const AUTH_FETCH: RequestInit = { credentials: "include" };

export default function ModalNuevoProducto({ isOpen, onClose, productoEditar }: ModalProps) {
  const [imagenes, setImagenes] = useState<cloudinary[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [formulario, setFormulario] = useState({
    nombre: "",
    precio: 0,
    descripcion: "",
    stock_cantidad: 0,
    imagenes_url: [] as string[],
  });

  // Producto final (sin ingredientes): el stock se carga a mano.
  // Producto con ingredientes: el stock lo calcula el back según el stock de cada ingrediente.
  const [sinIngredientes, setSinIngredientes] = useState(false);

  // ---- Categorías (recursivo: arma un único camino padre -> hijo) ----
  const [categorias, setCategorias] = useState<Categoria[]>([]); // opciones del nivel actual
  const [tempCategoriaId, setTempCategoriaId] = useState("");
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<CategoriaSeleccionada[]>([]);

  // ---- Ingredientes ----
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState<Ingrediente[]>([]);
  const [tempIngredienteId, setTempIngredienteId] = useState("");
  const [tempCantidadIngrediente, setTempCantidadIngrediente] = useState<number | "">("");
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<ProductoIngredienteRead[]>([]);

  const subirUnaImagen = async (archivo: File): Promise<cloudinary> => {
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("folder", "prueba");

    const resp = await fetch("http://localhost:8000/cloudinary/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!resp.ok) throw new Error(`Error al subir: ${resp.status}`);

    const data: { ok: boolean; url: string; public_id: string } = await resp.json();
    if (!data.ok) throw new Error("El servidor indicó que la subida falló");

    return { url: data.url, public_id: data.public_id };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = e.target.files;
    if (!archivos || archivos.length === 0) return;

    setSubiendo(true);

    const subidas = await Promise.all(
      Array.from(archivos).map((archivo) => subirUnaImagen(archivo))
    );

    setImagenes((prev) => [...prev, ...subidas]);
    setSubiendo(false);
    e.target.value = "";
  };

  // Si es edición, precargar los datos del producto
  useEffect(() => {
    if (productoEditar) {
      setFormulario({
        nombre: productoEditar.nombre,
        precio: productoEditar.precio,
        descripcion: productoEditar.descripcion ?? "",
        stock_cantidad: productoEditar.stock_cantidad,
        imagenes_url: productoEditar.imagenes_url,
      });
      setImagenes(productoEditar.imagenes_url.map((url) => ({ url, public_id: "" })));
      setSinIngredientes(productoEditar.ingredientes.length === 0);

      // El producto trae categorías planas (sin marca de "principal" ni orden de camino).
      // Se cargan tal cual, marcando la primera como principal por defecto.
      setCategoriasSeleccionadas(
        productoEditar.categorias.map((c: Categoria, index: number) => ({
          categoriaId: c.id,
          nombre: c.nombre,
          principal: index === 0,
        }))
      );

      setIngredientesSeleccionados(productoEditar.ingredientes);
    }
  }, [productoEditar]);

  // Traer ingredientes disponibles una sola vez
  useEffect(() => {
    fetch("http://localhost:8000/ingredientes", AUTH_FETCH)
      .then((res) => res.json())
      .then((data) => setIngredientesDisponibles(Array.isArray(data) ? data : []));
  }, []);

  // Traer las opciones de categoría del nivel correspondiente:
  // - si todavía no se eligió ninguna, trae las categorías raíz
  // - si ya se eligió una, trae las subcategorías de la última elegida
  // Así se arma un único camino (padre -> hijo) y no se pueden mezclar
  // ramas distintas (ej: Pizza y Hamburguesa) en la misma selección.
  useEffect(() => {
    const ultima = categoriasSeleccionadas[categoriasSeleccionadas.length - 1];
    const url = ultima
      ? `http://localhost:8000/categorias/?parent_id=${ultima.categoriaId}`
      : `http://localhost:8000/categorias/`;

    fetch(url, AUTH_FETCH)
      .then((res) => res.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []));

    setTempCategoriaId("");
  }, [categoriasSeleccionadas]);

  const agregarCategoriaLista = () => {
    if (!tempCategoriaId) return;
    const categoria = categorias.find((c) => c.id === Number(tempCategoriaId));
    if (!categoria) return;

    setCategoriasSeleccionadas((prev) => [
      ...prev,
      { categoriaId: categoria.id, nombre: categoria.nombre, principal: prev.length === 0 },
    ]);
  };

  // Quitar una categoría del camino: también se quitan las que se
  // agregaron después de ella, porque dependen de esa como su "padre".
  const quitarCategoria = (categoriaId: number) => {
    setCategoriasSeleccionadas((prev) => {
      const index = prev.findIndex((c) => c.categoriaId === categoriaId);
      return prev.slice(0, index);
    });
  };

  const marcarComoPrincipal = (categoriaId: number) => {
    setCategoriasSeleccionadas((prev) =>
      prev.map((c) => ({ ...c, principal: c.categoriaId === categoriaId }))
    );
  };

  const agregarIngredienteLista = () => {
    if (!tempIngredienteId || tempCantidadIngrediente === "") return;
    const ingrediente = ingredientesDisponibles.find((i) => i.id === Number(tempIngredienteId));
    if (!ingrediente) return;

    setIngredientesSeleccionados((prev) => [
      ...prev,
      {
        ingrediente_id: ingrediente.id,
        nombre: ingrediente.nombre,
        cantidad: tempCantidadIngrediente,
        es_removible: true, // valor por defecto, simple
      },
    ]);
    setTempIngredienteId("");
    setTempCantidadIngrediente("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formulario,
      imagenes_url: imagenes.map((i) => i.url),
      categorias: categoriasSeleccionadas.map((c) => ({
        categoria_id: c.categoriaId,
        principal: c.principal,
      })),
      ingredientes: ingredientesSeleccionados,
    };

    const url = productoEditar
      ? `http://localhost:8000/productos/${productoEditar.id}`
      : "http://localhost:8000/productos";

    await fetch(url, {
      method: productoEditar ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    onClose();
  };

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
          <button onClick={onClose} className="text-gray-400 hover:text-[#E63946] font-black text-sm p-1 cursor-pointer">✕</button>
        </div>

        <form className="space-y-3.5" onSubmit={handleSubmit}>

          {/* Fila Doble: Nombre y Precio */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre</label>
              <input type="text" required value={formulario.nombre} onChange={e => setFormulario({...formulario, nombre: e.target.value})} className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] font-medium" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Precio ($)</label>
              <input type="number" step="0.1" required value={formulario.precio} onChange={e=>setFormulario({...formulario, precio: Number(e.target.value)})} className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] font-medium" />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Descripción</label>
            <textarea rows={2} value={formulario.descripcion} onChange={(e) => setFormulario({...formulario, descripcion: e.target.value})} className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] font-medium resize-none" />
          </div>

          {/* ========================================================================= */}
          {/* RELACIÓN 1: PRODUCTO - CATEGORÍA (Muchos a Muchos, recursivo) */}
          {/* ========================================================================= */}
          <div className="space-y-2 bg-[#FAFAFA] p-2.5 rounded-xl border border-gray-100/40">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Enlazar Categorías
            </label>

            <div className="flex gap-2">
              <select
                value={tempCategoriaId}
                onChange={(e) => setTempCategoriaId(e.target.value)}
                className="flex-grow px-2 py-1.5 text-xs bg-white border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none font-medium cursor-pointer"
              >
                <option value="">Selecciona una categoría...</option>

                {categorias.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={agregarCategoriaLista}
                className="bg-[#1E1E24] text-white text-xs font-bold px-3 rounded-xl hover:bg-[#FFB703] hover:text-[#1E1E24] transition-colors cursor-pointer"
              >
                <BsPlus></BsPlus>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {categoriasSeleccionadas.map(c => (
                <span
                  key={c.categoriaId}
                  className="inline-flex items-center text-[10px] font-bold bg-white text-[#1E1E24] border border-gray-100 px-2 py-0.5 rounded-md gap-1 shadow-2xs"
                >
                  <input
                    type="checkbox"
                    checked={c.principal}
                    onChange={() => marcarComoPrincipal(c.categoriaId)}
                    title="Marcar como principal"
                    className="w-2.5 h-2.5 cursor-pointer accent-[#FFB703]"
                  />

                  {c.nombre}

                  <button
                    type="button"
                    onClick={() => quitarCategoria(c.categoriaId)}
                    className="text-[#E63946] font-black cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          {/* ========================================================================= */}
          {/* RELACIÓN 2: PRODUCTO - INGREDIENTE (Muchos a Muchos con Atributo Cantidad) */}
          {/* ========================================================================= */}
          <div className="flex items-center space-x-2 select-none">
            <label className="relative flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sinIngredientes}
                onChange={(e) => {
                  setSinIngredientes(e.target.checked);
                  if (e.target.checked) {
                    setIngredientesSeleccionados([]);
                  }
                }}
                className="sr-only peer"
              />

              <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>

            <span className="text-[10px] font-bold text-[#1E1E24] uppercase tracking-wide">
              Producto sin ingredientes (ej: gaseosa, postre envasado)
            </span>
          </div>

          {sinIngredientes ? (
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Stock disponible
              </label>
              <input
                type="number"
                required
                value={formulario.stock_cantidad}
                onChange={(e) => setFormulario({ ...formulario, stock_cantidad: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] font-medium"
              />
            </div>
          ) : (
          <div className="space-y-2 bg-[#FAFAFA] p-2.5 rounded-xl border border-gray-100/40">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Ingredientes
            </label>

            <div className="grid grid-cols-5 gap-2">
              <select
                value={tempIngredienteId}
                onChange={(e) => setTempIngredienteId(e.target.value)}
                className="col-span-3 px-2 py-1.5 text-xs bg-white border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none font-medium cursor-pointer"
              >
                <option value="">Ingrediente...</option>

                {ingredientesDisponibles.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.nombre}
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="0.01"
                value={tempCantidadIngrediente}
                onChange={(e) =>
                  setTempCantidadIngrediente(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="Cant."
                className="col-span-1 px-2 py-1.5 text-xs bg-white border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none font-medium"
              />

              <button
                type="button"
                onClick={agregarIngredienteLista}
                className="col-span-1 bg-[#1E1E24] text-white text-xs font-bold rounded-xl hover:bg-[#FFB703] hover:text-[#1E1E24] transition-colors cursor-pointer"
              >
                <BsPlus className='w-5 h-5'></BsPlus>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {ingredientesSeleccionados.map(i => (
                <span
                  key={i.ingrediente_id}
                  className="inline-flex items-center text-[10px] font-bold bg-white text-[#1E1E24] border border-gray-100 px-2 py-0.5 rounded-md gap-1 shadow-2xs"
                >
                  {i.nombre} ({i.cantidad})

                  <button
                    type="button"
                    onClick={() =>
                      setIngredientesSeleccionados(
                        ingredientesSeleccionados.filter(
                          item => item.ingrediente_id !== i.ingrediente_id
                        )
                      )
                    }
                    className="text-[#E63946] font-black cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          )}
          {/* Fila Doble: Stock Cantidad e Imagen */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Imagen del Plato
              </label>
              <div className="flex items-center space-x-2">
                {imagenes.map((i: cloudinary, index: number) =>
                (<div key={index} className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-dashed border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src={i.url} alt="Prev" className="w-full h-full object-cover"/>
                </div>)
                )
                }
                <label className="bg-white border border-gray-200 hover:border-[#FFB703] text-gray-500 font-bold text-[10px] py-1.5 px-2.5 rounded-xl transition-all cursor-pointer shadow-2xs">
                  <span>Subir</span>
                  <input type="file" accept="image/*" className="hidden" multiple onChange={handleFileChange} />
                </label>
              </div>
            </div>
          </div>

          {/* Botonera Inferior del Modal */}
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
              className="w-2/3 bg-[#E63946] hover:bg-opacity-95 text-white font-extrabold text-xs py-2 rounded-xl tracking-wider uppercase transition-all shadow-md active:scale-98 focus:outline-none cursor-pointer text-center"
            >
              {productoEditar ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}