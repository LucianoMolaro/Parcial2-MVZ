import React, { useEffect, useState } from 'react';
import { IngredienteSchema } from '../models/Ingrediente';
import { UnidadMedidaSchema } from '../models/UnidadMedida';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingrediente?: IngredienteSchema;
}

export default function ModalNuevoIngrediente({ isOpen, onClose, ingrediente }: ModalProps) {
  const editar = ingrediente !== undefined;

  const [nombre, setNombre] = useState(ingrediente?.nombre ?? '');
  const [esAlergeno, setEsAlergeno] = useState(ingrediente?.es_alergeno ?? false);
  const [stockCantidad, setStockCantidad] = useState<number | ''>(ingrediente?.stock_cantidad ?? '');
  const [tipoMedicion, setTipoMedicion] = useState<string>('');
  const [unidadMedidaId, setUnidadMedidaId] = useState<string>(ingrediente?.unidad_medida?.id?.toString() ?? '');

  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedidaSchema[]>([]);

  useEffect(() => {
    const cargarUnidades = async () => {
      const res = await fetch('http://localhost:8000/unidades/medida/listar', { credentials: 'include' });
      const data = await res.json();
      setUnidadesMedida(data);
    };
    cargarUnidades();
  }, []);

  useEffect(() => {
    if (ingrediente?.unidad_medida && unidadesMedida.length > 0) {
      setTipoMedicion(ingrediente.unidad_medida.tipo);
    }
  }, [ingrediente, unidadesMedida]);

  if (!isOpen) return null;

  const unidadesFiltradas = unidadesMedida.filter((uni) => uni.tipo === tipoMedicion);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nombre,
      es_alergeno: esAlergeno,
      stock_cantidad: Number(stockCantidad) || 0,
      unidad_medida_id: Number(unidadMedidaId),
    };

    try {
      const res = await fetch('http://localhost:8000/ingredientes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('No se pudo crear el ingrediente');
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const editarIngrediente = async () => {
    const payload = {
      id: ingrediente?.id,
      nombre,
      es_alergeno: esAlergeno,
      stock_cantidad: Number(stockCantidad) || 0,
      unidad_medida_id: Number(unidadMedidaId),
    };

    try {
      const res = await fetch(`http://localhost:8000/ingredientes/${ingrediente!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('No se pudo modificar el ingrediente');
      onClose();
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-xl p-5 space-y-4 z-10 font-sans antialiased">
        <div className="flex items-start justify-between border-b border-gray-50 pb-2">
          <div>
            <h2 className="text-base font-black text-[#1E1E24] tracking-tight">
              {editar ? 'Editar' : 'Nuevo'} <span className="text-[#E63946]">Ingrediente</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#E63946] font-black text-sm p-1 cursor-pointer">✕</button>
        </div>

        <form onSubmit={editar ? (e) => e.preventDefault() : manejarEnvio} className="space-y-3.5">
          <div className="space-y-1">
            <label htmlFor="nombre" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre del Ingrediente</label>
            <input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Queso Cheddar, Crema de Leche"
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="tipoMedicion" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Medición</label>
              <select
                id="tipoMedicion"
                required
                value={tipoMedicion}
                onChange={(e) => {
                  setTipoMedicion(e.target.value);
                  setUnidadMedidaId('');
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] transition-colors font-medium cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="" disabled hidden>Selecciona...</option>
                {Array.from(new Set(unidadesMedida.map((um) => um.tipo))).map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="unidad" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unidad</label>
              <select
                id="unidad"
                required
                value={unidadMedidaId}
                onChange={(e) => setUnidadMedidaId(e.target.value)}
                disabled={!tipoMedicion}
                className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] transition-colors font-medium cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="" disabled hidden>Selecciona...</option>
                {unidadesFiltradas.map((uni) => (
                  <option key={uni.id} value={uni.id}>{uni.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="stock" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cantidad Inicial en Stock</label>
            <input
              id="stock"
              type="number"
              step="0.01"
              required
              value={stockCantidad}
              onChange={(e) => setStockCantidad(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] font-medium"
            />
          </div>

          <div className="flex items-center space-x-2 pt-0.5 select-none">
            <label className="relative flex items-center cursor-pointer">
              <input type="checkbox" checked={esAlergeno} onChange={(e) => setEsAlergeno(e.target.checked)} className="sr-only peer" />
              <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
            <span className="text-[11px] font-bold text-[#1E1E24]">Es alergeno?</span>
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-gray-50 hover:bg-gray-100 text-[#1E1E24] border border-gray-100 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer text-center"
            >
              Cancelar
            </button>

            {editar ? (
              <>
                <button
                  type="button"
                  onClick={editarIngrediente}
                  className="w-2/3 bg-[#E63946] hover:bg-opacity-95 text-white font-extrabold text-xs py-2 rounded-xl tracking-wider uppercase transition-all shadow-md active:scale-98 focus:outline-none cursor-pointer text-center"
                >
                  Guardar
                </button>
              </>
            ) : (
              <button
                type="submit"
                className="w-2/3 bg-[#E63946] hover:bg-opacity-95 text-white font-extrabold text-xs py-2 rounded-xl tracking-wider uppercase transition-all shadow-md active:scale-98 focus:outline-none cursor-pointer text-center"
              >
                Crear
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}