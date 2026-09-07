import { useEffect, useRef, useState } from "react";

export default function PaginaSincronizacion() {
    const socket = useRef<WebSocket | null>(null);

    const [estado, setEstado] = useState("Desconectado");
    const [mensajes, setMensajes] = useState<any[]>([]);
    

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws/prueba");

        socket.current = ws;

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            console.log("Mensaje recibido:", data);

            setMensajes((prev) => [...prev, data]);
        };

        ws.onerror = (e) => {
            console.error(e);
        };

        ws.onclose = () => {
            console.log("Desconectado");
            setEstado("Desconectado");
        };

        return () => {
            ws.close();
        };
    }, []);

    function enviarMensaje() {
        fetch("http:localhost:8000/ws/mensaje")
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>Prueba WebSocket</h1>

            <p>Estado: {estado}</p>

            <button onClick={enviarMensaje}>
                Enviar mensaje
            </button>

            <hr />

            {mensajes.map((m, i) => (
                <pre key={i}>
                    {JSON.stringify(m, null, 2)}
                </pre>
            ))}
        </div>
    );
}


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