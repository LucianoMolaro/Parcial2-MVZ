import React, { useEffect, useState } from 'react';
import { IngredienteRead } from '../models/Ingrediente';
import { UnidadMedidaRead } from '../models/UnidadMedida';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingrediente?: IngredienteRead | null;
}

export default function ModalNuevoIngrediente({ isOpen , onClose, ingrediente }: ModalProps) {
  // const editar = ingrediente !== undefined;

  const [formulario, setFormulario] = useState({
    nombre: "",
    precio: 0,
    unidad_medida_id: -1,
    es_alergeno: false,
    stock_cantidad: 0
  });
  const [original, setOriginal] = useState<IngredienteRead | null>(null)
  const [unidades, setUnidades] = useState<UnidadMedidaRead[]>([])
  const [unidadesTipo, setUnidadesTipo] = useState("");


  // const [esAlergeno, setEsAlergeno] = useState(ingrediente?.es_alergeno ?? false);
  // const [stockCantidad, setStockCantidad] = useState<number | ''>(ingrediente?.stock_cantidad ?? '');

  // const [unidadMedidaId, setUnidadMedidaId] = useState<string>(ingrediente?.unidad_medida?.id?.toString() ?? '');

  // const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedidaSchema[]>([]);
  const cargar = async () => {
    try {
      const res = await fetch('http://localhost:8000/unidades/medida/todas', {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) {console.log( 'No se pudieron obtener los elementos')};
      
      const data = await res.json();
      setUnidades(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
      if (!isOpen) return;
      cargar();
      if (ingrediente) {
        setOriginal(ingrediente)
        setFormulario({
            nombre: ingrediente.nombre,
            precio: ingrediente.precio,
            unidad_medida_id: ingrediente.unidad_medida.id,
            es_alergeno: ingrediente.es_alergeno,
            stock_cantidad: ingrediente.stock_cantidad
        });
      }else{
        setOriginal(null)
      } 
  }, [isOpen, ingrediente]);

  // useEffect(() => {
  //   if (ingrediente?.unidad_medida && unidadesMedida.length > 0) {
  //     setTipoMedicion(ingrediente.unidad_medida.tipo);
  //   }
  // }, [ingrediente, unidadesMedida]);

  // if (!isOpen) return null;

  // const unidadesFiltradas = ;

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!!original){
      if( 
        original &&
        original.nombre === formulario.nombre &&
        original.precio === formulario.precio &&
        original.unidad_medida.id === formulario.unidad_medida_id &&
        original.es_alergeno === formulario.es_alergeno &&
        original.stock_cantidad === formulario.stock_cantidad
      ){
        onClose();
        return;
      }else{
        const res = await fetch(`http://localhost:8000/ingredientes/editar/${original.id}`, {
          method: 'PUT',
          credentials: "include",
          headers:{
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formulario)
        })
        if(!res.ok) throw new Error("No se pudo actualizar el ingrediente")
      }
    }else{
      const res = await fetch(`http://localhost:8000/ingredientes/crear`, {
          method: 'POST',
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formulario)
        })
        
        // if(!res.ok) throw new Error("No se pudo crear el ingrediente")
      const data = await res.json();

      console.log("STATUS:", res.status);
      console.log("DATA:", data);    
    }

    onClose()

    // const payload = {
    //   nombre,
    //   es_alergeno: esAlergeno,
    //   stock_cantidad: Number(stockCantidad) || 0,
    //   unidad_medida_id: Number(unidadMedidaId),
    // };

    // try {
    //   const res = await fetch('http://localhost:8000/ingredientes/listar', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     credentials: 'include',
    //     body: JSON.stringify(payload),
    //   });
    //   if (!res.ok) throw new Error('No se pudo crear el ingrediente');
    //   onClose();
    // } catch (err) {
    //   console.error(err);
    // }
  };

  // const editarIngrediente = async () => {



  // };
  if(!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-xl p-5 space-y-4 z-10 font-sans antialiased">
        <div className="flex items-start justify-between border-b border-gray-50 pb-2">
          <div>
            <h2 className="text-base font-black text-[#1E1E24] tracking-tight">
              {original ? 'Editar' : 'Nuevo'} <span className="text-[#E63946]">Ingrediente</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#E63946] font-black text-sm p-1 cursor-pointer">✕</button>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-3.5">
          <div className="space-y-1">
            <label htmlFor="nombre" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre del Ingrediente</label>
            <input
              id="nombre"
              type="text"
              required
              value={formulario.nombre}
              onChange={(e) => setFormulario({...formulario, nombre: e.target.value})}
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
                value={unidadesTipo}
                onChange={(e) => {
                  setFormulario({...formulario,unidad_medida_id: -1}), 
                  setUnidadesTipo(e.target.value)}
                }
                className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] transition-colors font-medium cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="" disabled hidden>Selecciona...</option>
                {Array.from(new Set(unidades.map((um) => um.tipo))).map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="unidad" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unidad</label>
              <select
                id="unidad"
                required
                value={formulario.unidad_medida_id}
                onChange={(e) => setFormulario({...formulario, unidad_medida_id: Number(e.target.value)})}
                disabled={!unidadesTipo}
                className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] transition-colors font-medium cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value={-1} disabled hidden>Selecciona...</option>
                {(unidades.filter((uni) => uni.tipo === unidadesTipo)).map((uni) => (
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
              value={formulario.stock_cantidad}
              onChange={(e) => setFormulario({...formulario, stock_cantidad: Number(e.target.value)})}
              placeholder="0.00"
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] focus:outline-none focus:border-[#FFB703] font-medium"
            />
          </div>

          <div className="flex items-center space-x-2 pt-0.5 select-none">
            <label className="relative flex items-center cursor-pointer">
              <input type="checkbox" checked={formulario.es_alergeno} onChange={(e) => setFormulario({...formulario, es_alergeno: e.target.checked})} className="sr-only peer" />
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

            {!!original ? (
              <>
                <button
                  type="submit"
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