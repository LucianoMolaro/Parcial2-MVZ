import { useEffect, useState } from 'react';
import BarraNavegacion from '../components/Navbar';
import { BsBan, BsPencilSquare, BsTrash } from 'react-icons/bs';
import FormularioIngrediente from '../components/FormularioIngrediente';
import { IngredienteRead } from '../models/Ingrediente';
import ModalNuevoIngrediente from '../components/FormularioIngrediente';
import { mostrarErrorSiFalla } from '../utils/apiError';

export default function PaginaIngredientesAdmin() {
  const [ingredientes, setIngredientes] = useState<IngredienteRead[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ingredienteEditar, setIngredienteEditar] = useState<IngredienteRead | null>(null);

  const cargarIngredientes = async () => {
    try {
      const res = await fetch('http://localhost:8000/ingredientes/todos', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('No se pudieron obtener ingredientes');
      const data = await res.json();
      
      setIngredientes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarIngredientes();
  }, []);

  const cerrarModal = () => {
    setMostrarModal(false);
    setIngredienteEditar(null);
    cargarIngredientes();
  };

  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
        <div className="w-4/5 mx-auto space-y-6">
          
          {/* --- ENCABEZADO Y ACCIÓN DE CREACIÓN --- */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-red-500 tracking-tight">
                Ingredientes
              </h1>
            </div>
            
            <button 
              onClick={() => {
                setIngredienteEditar(null)
                setMostrarModal(true)
              }}
              className="bg-[#1E1E24] hover:bg-[#E63946] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer focus:outline-none self-start sm:self-center"
            >
              Crear ingrediente
            </button>

            {/* Inyección de tu modal de ingredientes con las dependencias dinámicas */}
            {mostrarModal && (
              <FormularioIngrediente 
                isOpen={mostrarModal} 
                onClose={cerrarModal}
                ingrediente={ingredienteEditar}
              />
            )}
          </div>

          {/* --- LISTADO DE TARJETAS HORIZONTALES (80% ancho) --- */}
          <div className="space-y-2.5">
            {ingredientes.map((ing) => {
              return (
                <div 
                  key={ing.id}
                  className="bg-white rounded-xl p-3.5 border border-gray-100/70 shadow-xs flex items-center justify-between gap-4 transition-all duration-200 hover:shadow-sm"
                >
                {/* INFO IZQUIERDA */}
                <div className="flex items-center min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="text-sm font-extrabold text-[#1E1E24] leading-tight truncate">
                        {ing.nombre}
                      </h3>

                      {ing.es_alergeno && (
                        <span className="text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          ⚠️ Alérgeno
                        </span>
                      )}
                    </div>

                    {/* Información técnica */}
                    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] font-medium">
                      <div className="flex items-center gap-1">
                        <span className="text-stone-500">Stock:</span>
                        <span
                          className={`font-bold text-stone-700`}
                        >
                          {ing.stock_cantidad} {ing.unidad_medida?.simbolo}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-stone-500">Unidad:</span>
                        <span className="font-semibold text-stone-700">
                          {ing.unidad_medida?.nombre}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-stone-500">Símbolo:</span>
                        <span className="font-semibold text-stone-700">
                          {ing.unidad_medida?.simbolo}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-stone-500">Tipo:</span>
                        <span className="font-semibold text-stone-700">
                          {ing.unidad_medida?.tipo}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                  {/* LADO DERECHO: ACCIONES DE EDICIÓN Y BORRADO */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {/* Editar */}
                    <button
                      onClick={() => {
                        setIngredienteEditar(ing)
                        setMostrarModal(true)
                      }}
                      title="Editar ingrediente"
                      className="bg-[#FFB703] hover:bg-[#1E1E24] text-[#1E1E24] hover:text-white p-1.5 rounded-lg transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none flex items-center justify-center"
                    >
                      <BsPencilSquare className="h-4 w-4" />
                    </button>
                    <ModalNuevoIngrediente isOpen={mostrarModal} onClose={cerrarModal} ingrediente={ingredienteEditar}/>

                    {/* Eliminar */}
                    <button
                      onClick={async () => {
                        if (!confirm(`¿Eliminar "${ing.nombre}"?`)) return;
                        const res = await fetch(`http://localhost:8000/ingredientes/${ing.id}`, {
                          method: 'DELETE',
                          credentials: 'include',
                        });
                        if (await mostrarErrorSiFalla(res, 'No se pudo eliminar el ingrediente.')) return;
                        cargarIngredientes();
                      }}
                      title="Desactivar del inventario"
                      className="bg-gray-50 hover:bg-[#E63946] border border-gray-100/70 text-gray-400 hover:text-white p-1.5 rounded-lg transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none flex items-center justify-center"
                    >
                      <BsBan className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              );
            })}

            {ingredientes.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100/60 p-8 text-center text-xs font-medium text-gray-400">
                No hay ingredientes registrados en el inventario actualmente.
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}