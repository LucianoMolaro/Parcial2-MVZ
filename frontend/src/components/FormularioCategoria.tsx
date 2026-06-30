import React, { useEffect, useState } from 'react';
import { CategoriaTree } from '../models/Categoria';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoriaEditar?: CategoriaTree;
  parentIdPreset?: number;
}

export default function FormularioCategoria({ isOpen, onClose, categoriaEditar, parentIdPreset }: ModalProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [habilitada, setHabilitada] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<CategoriaTree[]>([]);
  const [seleccionNiveles, setSeleccionNiveles] = useState<number[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/categorias/arbol', { credentials: 'include' })
      .then(r => r.json())
      .then(setCategorias);
  }, []);

  useEffect(() => {
    if (categoriaEditar) {
      setNombre(categoriaEditar.nombre);
      setDescripcion(categoriaEditar.descripcion ?? '');
    } else {
      setNombre('');
      setDescripcion('');
      setSeleccionNiveles(parentIdPreset ? [parentIdPreset] : []);
    }
  }, [categoriaEditar, parentIdPreset]);

  if (!isOpen) return null;

  const manejarCambioImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) setPreviewUrl(URL.createObjectURL(archivo));
  };

  const manejarCambioSelect = (nivelIndex: number, valor: string) => {
    setSeleccionNiveles(prev => {
      const nuevoHistorial = prev.slice(0, nivelIndex);
      if (valor !== '') nuevoHistorial.push(Number(valor));
      return nuevoHistorial;
    });
  };

  const renderizarSelectoresCascada = () => {
    const selectoresJSX = [];
    let opcionesActuales = categorias;

    selectoresJSX.push(
      <div key="nivel-0" className="space-y-1">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Categoría Principal
        </label>
        <select
          value={seleccionNiveles[0] ?? ''}
          onChange={(e) => manejarCambioSelect(0, e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] transition-colors font-medium cursor-pointer"
        >
          <option value="">Categoria principal</option>
          {opcionesActuales.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </div>
    );

    for (let i = 0; i < seleccionNiveles.length; i++) {
      const idSeleccionado = seleccionNiveles[i];
      const categoriaEncontrada = opcionesActuales.find(c => c.id === idSeleccionado);

      if (categoriaEncontrada?.subcategorias && categoriaEncontrada.subcategorias.length > 0) {
        opcionesActuales = categoriaEncontrada.subcategorias;
        const siguienteNivelIndex = i + 1;

        selectoresJSX.push(
          <div key={`nivel-${siguienteNivelIndex}`} className="space-y-1 animate-fadeIn">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Subcategoría
            </label>
            <select
              value={seleccionNiveles[siguienteNivelIndex] ?? ''}
              onChange={(e) => manejarCambioSelect(siguienteNivelIndex, e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] transition-colors font-medium cursor-pointer"
            >
              <option value="">Dentro de...</option>
              {opcionesActuales.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.nombre}</option>
              ))}
            </select>
          </div>
        );
      } else {
        break;
      }
    }

    return selectoresJSX;
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    const padreFinalId = seleccionNiveles.length > 0 ? seleccionNiveles[seleccionNiveles.length - 1] : null;

    const payload = { nombre, descripcion: descripcion || null, parent_id: padreFinalId };

    const url = categoriaEditar
      ? `http://localhost:8000/categorias/${categoriaEditar.id}`
      : 'http://localhost:8000/categorias/';
    const method = categoriaEditar ? 'PUT' : 'POST';

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

      {/* CAPA DE DESENFOQUE OSCURA (Backdrop) */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* CONTENEDOR VENTANA MODAL (Sutil y compacta) */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-xl p-5 space-y-4 z-10 max-h-[90vh] overflow-y-auto scrollbar-hide">

        {/* Encabezado del modal */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-black text-[#1E1E24] tracking-tight">
              {categoriaEditar ? 'Editar' : 'Nueva'} <span className="text-[#E63946]">Categoría</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#E63946] font-black text-sm p-1 cursor-pointer">✕</button>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-3.5">
          {/* Nombre */}
          <div className="space-y-1">
            <label htmlFor="nombre" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre de categoria</label>
            <input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label htmlFor="descripcion" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Descripción</label>
            <textarea
              id="descripcion"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium resize-none leading-normal"
            />
          </div>
          {/* Renderizado dinámico de los Selects en cascada */}
          <div className="space-y-3">
            {renderizarSelectoresCascada()}
          </div>

          {/* Subida de Imagen Sutil */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Multimedia</label>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-gray-100 border-dashed flex items-center justify-center overflow-hidden">
                {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-sm">🖼️</span>}
              </div>
              <label className="bg-white border border-gray-200 hover:border-[#FFB703] text-gray-500 font-bold text-[11px] py-1.5 px-3 rounded-xl transition-all cursor-pointer shadow-xs active:scale-98">
                <span>Cargar Imagen</span>
                <input type="file" accept="image/*" className="hidden" onChange={manejarCambioImagen} />
              </label>
            </div>
          </div>

          {/* Switch de Habilitación */}
          <div className="flex items-center space-x-2 pt-0.5 select-none">
            <label className="relative flex items-center cursor-pointer">
              <input type="checkbox" checked={habilitada} onChange={(e) => setHabilitada(e.target.checked)} className="sr-only peer" />
              <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
            <span className="text-[11px] font-bold text-[#1E1E24]">Habilitar inmediatamente</span>
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
