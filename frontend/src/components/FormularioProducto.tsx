import React, { useEffect, useState } from 'react';

interface CategoriaOption { id: number; nombre: string; }
interface IngredienteOption { id: number; nombre: string; unidad_medida_id: number; }
interface CategoriaSeleccionada { categoriaId: number; nombre: string; }
interface IngredienteSeleccionado { ingredienteId: number; nombre: string; cantidad: number; }

interface ProductoEditar {
  id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  disponible: boolean;
  stock_cantidad: number;
  categorias?: { id: number; nombre: string }[];
  ingredientes?: { ingrediente_id: number; nombre: string; cantidad: number }[];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  productoEditar?: ProductoEditar;
}

export default function ModalNuevoProducto({ isOpen, onClose, productoEditar }: ModalProps) {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState<number | ''>('');
  const [descripcion, setDescripcion] = useState('');
  const [stockCantidad, setStockCantidad] = useState<number>(0);
  const [habilitado, setHabilitado] = useState(true);
  const [disponible, setDisponible] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [categoriasDisponibles, setCategoriasDisponibles] = useState<CategoriaOption[]>([]);
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState<IngredienteOption[]>([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<CategoriaSeleccionada[]>([]);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<IngredienteSeleccionado[]>([]);

  const [tempCategoriaId, setTempCategoriaId] = useState('');
  const [tempIngredienteId, setTempIngredienteId] = useState('');
  const [tempCantidadIngrediente, setTempCantidadIngrediente] = useState<number | ''>('');

  useEffect(() => {
    fetch('http://localhost:8000/categorias/', { credentials: 'include' })
      .then(r => r.json()).then(setCategoriasDisponibles);
    fetch('http://localhost:8000/ingredientes/', { credentials: 'include' })
      .then(r => r.json()).then(setIngredientesDisponibles);
  }, []);

  useEffect(() => {
    if (productoEditar) {
      setNombre(productoEditar.nombre);
      setPrecio(productoEditar.precio);
      setDescripcion(productoEditar.descripcion ?? '');
      setStockCantidad(productoEditar.stock_cantidad);
      setDisponible(productoEditar.disponible);
      setCategoriasSeleccionadas((productoEditar.categorias ?? []).map(c => ({ categoriaId: c.id, nombre: c.nombre })));
      setIngredientesSeleccionados((productoEditar.ingredientes ?? []).map(i => ({ ingredienteId: i.ingrediente_id, nombre: i.nombre, cantidad: i.cantidad })));
    } else {
      setNombre(''); setPrecio(''); setDescripcion(''); setStockCantidad(0);
      setDisponible(true); setHabilitado(true);
      setCategoriasSeleccionadas([]); setIngredientesSeleccionados([]);
      setPreviewUrl(null);
    }
  }, [productoEditar]);

  if (!isOpen) return null;

  const manejarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) setPreviewUrl(URL.createObjectURL(archivo));
  };

  const agregarCategoriaLista = () => {
    if (!tempCategoriaId) return;
    const cat = categoriasDisponibles.find(c => c.id === Number(tempCategoriaId));
    if (cat && !categoriasSeleccionadas.some(c => c.categoriaId === cat.id)) {
      setCategoriasSeleccionadas([...categoriasSeleccionadas, { categoriaId: cat.id, nombre: cat.nombre }]);
      setTempCategoriaId('');
    }
  };

  const agregarIngredienteLista = () => {
    if (!tempIngredienteId || !tempCantidadIngrediente) return;
    const ing = ingredientesDisponibles.find(i => i.id === Number(tempIngredienteId));
    if (ing && !ingredientesSeleccionados.some(i => i.ingredienteId === ing.id)) {
      setIngredientesSeleccionados([...ingredientesSeleccionados, {
        ingredienteId: ing.id,
        nombre: ing.nombre,
        cantidad: Number(tempCantidadIngrediente),
      }]);
      setTempIngredienteId('');
      setTempCantidadIngrediente('');
    }
  };

  const manejarEnvioFormulario = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nombre,
      precio: Number(precio),
      descripcion: descripcion || null,
      disponible,
      stock_cantidad: stockCantidad,
      categoria_ids: categoriasSeleccionadas.map(c => c.categoriaId),
      ingredientes: ingredientesSeleccionados.map(i => ({ ingrediente_id: i.ingredienteId, cantidad: i.cantidad })),
    };

    const url = productoEditar
      ? `http://localhost:8000/productos/${productoEditar.id}`
      : 'http://localhost:8000/productos/';
    const method = productoEditar ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Capa de desenfoque de fondo */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Ventana Modal (Configurada con scroll vertical interno sutil) */}
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl p-5 space-y-4 z-10 max-h-[90vh] overflow-y-auto scrollbar-hide font-sans antialiased">

        {/* Cabecera */}
        <div className="flex items-start justify-between border-b border-gray-50 pb-2">
          <div>
            <h2 className="text-base font-black text-[#1E1E24] tracking-tight">
              {productoEditar ? 'Editar' : 'Nuevo'} <span className="text-[#E63946]">Producto Menú</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#E63946] font-black text-sm p-1 cursor-pointer">✕</button>
        </div>

        <form onSubmit={manejarEnvioFormulario} className="space-y-3.5">

          {/* Fila Doble: Nombre y Precio */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre del Plato</label>
              <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Bacon Cheeseburger" className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] font-medium" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Precio ($)</label>
              <input type="number" step="0.01" required value={precio} onChange={(e) => setPrecio(e.target.value === '' ? '' : Number(e.target.value))} placeholder="8.99" className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] font-medium" />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Descripción Breve</label>
            <textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Detalla los componentes del plato..." className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] font-medium resize-none" />
          </div>

          {/* ========================================================================= */}
          {/* RELACIÓN 1: PRODUCTO - CATEGORÍA (Muchos a Muchos) */}
          {/* ========================================================================= */}
          <div className="space-y-2 bg-[#FAFAFA] p-2.5 rounded-xl border border-gray-100/40">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enlazar Categorías</label>
            <div className="flex gap-2">
              <select value={tempCategoriaId} onChange={(e) => setTempCategoriaId(e.target.value)} className="flex-grow px-2 py-1.5 text-xs bg-white border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none font-medium cursor-pointer">
                <option value="">Selecciona una categoría...</option>
                {categoriasDisponibles.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <button type="button" onClick={agregarCategoriaLista} className="bg-[#1E1E24] text-white text-xs font-bold px-3 rounded-xl hover:bg-[#FFB703] hover:text-[#1E1E24] transition-colors cursor-pointer">+</button>
            </div>
            {/* Badges sutiles de categorías seleccionadas */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {categoriasSeleccionadas.map(c => (
                <span key={c.categoriaId} className="inline-flex items-center text-[10px] font-bold bg-white text-[#1E1E24] border border-gray-100 px-2 py-0.5 rounded-md gap-1 shadow-2xs">
                  {c.nombre}
                  <button type="button" onClick={() => setCategoriasSeleccionadas(categoriasSeleccionadas.filter(item => item.categoriaId !== c.categoriaId))} className="text-[#E63946] font-black cursor-pointer">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RELACIÓN 2: PRODUCTO - INGREDIENTE (Muchos a Muchos con Atributo Cantidad) */}
          {/* ========================================================================= */}
          <div className="space-y-2 bg-[#FAFAFA] p-2.5 rounded-xl border border-gray-100/40">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ingredientes</label>
            <div className="grid grid-cols-5 gap-2">
              <select value={tempIngredienteId} onChange={(e) => setTempIngredienteId(e.target.value)} className="col-span-3 px-2 py-1.5 text-xs bg-white border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none font-medium cursor-pointer">
                <option value="">Ingrediente...</option>
                {ingredientesDisponibles.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
              </select>
              <input type="number" step="0.01" value={tempCantidadIngrediente} onChange={(e) => setTempCantidadIngrediente(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Cant." className="col-span-1 px-2 py-1.5 text-xs bg-white border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none font-medium" />
              <button type="button" onClick={agregarIngredienteLista} className="col-span-1 bg-[#1E1E24] text-white text-xs font-bold rounded-xl hover:bg-[#FFB703] hover:text-[#1E1E24] transition-colors cursor-pointer">+</button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ingredientesSeleccionados.map(i => (
                <span key={i.ingredienteId} className="inline-flex items-center text-[10px] font-bold bg-white text-[#1E1E24] border border-gray-100 px-2 py-0.5 rounded-md gap-1 shadow-2xs">
                  {i.nombre} ({i.cantidad})
                  <button type="button" onClick={() => setIngredientesSeleccionados(ingredientesSeleccionados.filter(item => item.ingredienteId !== i.ingredienteId))} className="text-[#E63946] font-black cursor-pointer">×</button>
                </span>
              ))}
            </div>
          </div>
          {/* Fila Doble: Stock Cantidad e Imagen */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Stock Disponible (Unidades)
              </label>
              <input
                type="number"
                value={stockCantidad}
                onChange={(e) => setStockCantidad(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Imagen del Plato
              </label>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-dashed border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {previewUrl ? <img src={previewUrl} alt="Prev" className="w-full h-full object-cover" /> : <span className="text-xs">🍔</span>}
                </div>
                <label className="bg-white border border-gray-200 hover:border-[#FFB703] text-gray-500 font-bold text-[10px] py-1.5 px-2.5 rounded-xl transition-all cursor-pointer shadow-2xs">
                  <span>Subir</span>
                  <input type="file" accept="image/*" className="hidden" onChange={manejarImagen} />
                </label>
              </div>
            </div>
          </div>

          {/* Fila Doble de Switches: Habilitado y Disponible (Campos booleanos de la clase SQLModel) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center space-x-2 select-none">
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={habilitado}
                  onChange={(e) => setHabilitado(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span className="text-[10px] font-bold text-[#1E1E24] uppercase tracking-wide">
                Habilitado
              </span>
            </div>

            <div className="flex items-center space-x-2 select-none">
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={disponible}
                  onChange={(e) => setDisponible(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span className="text-[10px] font-bold text-[#1E1E24] uppercase tracking-wide">
                Disponible en Menú
              </span>
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
