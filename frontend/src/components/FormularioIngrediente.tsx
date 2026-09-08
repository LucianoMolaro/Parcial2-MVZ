import React, { useEffect, useState } from 'react';
import { IngredienteRead } from '../models/Ingrediente';
import { UnidadMedidaRead } from '../models/UnidadMedida';
import { BsXLg } from 'react-icons/bs';

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

      <div className="relative z-10 w-full max-w-sm space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xl font-sans antialiased">
        <div className="flex items-start justify-between border-b border-gray-50 pb-2">
          <h2 className="text-base font-black tracking-tight text-[#1E1E24]">
            {original ? "Editar" : "Nuevo"} <span className="text-[#E63946]">Ingrediente</span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="cursor-pointer p-1 text-sm font-black text-gray-400 transition-colors hover:text-[#E63946]"
          >
            <BsXLg />
          </button>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-3.5">

          {/* Nombre + Precio */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label htmlFor="nombre" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Nombre del Ingrediente
              </label>
              <input
                id="nombre"
                type="text"
                required
                value={formulario.nombre}
                onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                placeholder="Ej: Queso Cheddar, Crema de Leche"
                className="w-full rounded-xl border border-gray-100 bg-[#FAFAFA] px-2.5 py-1.5 text-xs font-medium text-[#1E1E24] placeholder-gray-400 transition-colors focus:outline-none focus:border-[#FFB703]"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="precio" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Precio ($)
              </label>
              <input
                id="precio"
                type="number"
                step="0.1"
                required
                value={formulario.precio}
                onChange={(e) => setFormulario({ ...formulario, precio: Number(e.target.value) })}
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-100 bg-[#FAFAFA] px-2.5 py-1.5 text-xs font-medium text-[#1E1E24] placeholder-gray-400 transition-colors focus:outline-none focus:border-[#FFB703]"
              />
            </div>
          </div>

          {/* Medición + Unidad */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="tipoMedicion" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Medición
              </label>
              <select
                id="tipoMedicion"
                required
                value={unidadesTipo}
                onChange={(e) => {
                  setFormulario({ ...formulario, unidad_medida_id: -1 }),
                    setUnidadesTipo(e.target.value);
                }}
                className="w-full cursor-pointer rounded-xl border border-gray-100 bg-[#FAFAFA] px-2.5 py-1.5 text-xs font-medium text-[#1E1E24] transition-colors focus:outline-none focus:border-[#FFB703] disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="" disabled hidden>Selecciona...</option>
                {Array.from(new Set(unidades.map((um) => um.tipo))).map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="unidad" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Unidad
              </label>
              <select
                id="unidad"
                required
                value={formulario.unidad_medida_id}
                onChange={(e) => setFormulario({ ...formulario, unidad_medida_id: Number(e.target.value) })}
                disabled={!unidadesTipo}
                className="w-full cursor-pointer rounded-xl border border-gray-100 bg-[#FAFAFA] px-2.5 py-1.5 text-xs font-medium text-[#1E1E24] transition-colors focus:outline-none focus:border-[#FFB703] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value={-1} disabled hidden>Selecciona...</option>
                {unidades.filter((uni) => uni.tipo === unidadesTipo).map((uni) => (
                  <option key={uni.id} value={uni.id}>{uni.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock */}
          <div className="space-y-1">
            <label htmlFor="stock" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Cantidad Inicial en Stock
            </label>
            <input
              id="stock"
              type="number"
              step="0.01"
              required
              value={formulario.stock_cantidad}
              onChange={(e) => setFormulario({ ...formulario, stock_cantidad: Number(e.target.value) })}
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-100 bg-[#FAFAFA] px-2.5 py-1.5 text-xs font-medium text-[#1E1E24] focus:outline-none focus:border-[#FFB703]"
            />
          </div>

          {/* Es alergeno */}
          <div className="flex select-none items-center space-x-2 pt-0.5">
            <label className="relative flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formulario.es_alergeno}
                onChange={(e) => setFormulario({ ...formulario, es_alergeno: e.target.checked })}
                className="peer sr-only"
              />
              <div className="peer h-4 w-7 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#FFB703] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
            </label>
            <span className="text-[11px] font-bold text-[#1E1E24]">Es alergeno?</span>
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
              {original ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}