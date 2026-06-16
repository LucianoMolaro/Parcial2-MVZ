import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import {
  getIngredientes,
  crearIngrediente,
  editarIngrediente,
  eliminarIngrediente,
  getUnidadesMedida,
} from "../api/api";
import { Ingrediente, IngredienteCreate, IngredienteUpdate } from "../types";

const PAGE_SIZE = 10;

interface FormCrear {
  nombre: string;
  unidad_medida_id: number | "";
  es_alergeno: boolean;
  stock_cantidad: number;
}

interface FormEditar {
  nombre: string;
  es_alergeno: boolean;
  stock_cantidad: number;
}

const VACIO_CREAR: FormCrear = {
  nombre: "",
  unidad_medida_id: "",
  es_alergeno: false,
  stock_cantidad: 0,
};

export default function IngredientesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroAlergeno, setFiltroAlergeno] = useState<"" | "true" | "false">("");

  const [modalCrear, setModalCrear] = useState(false);
  const [formCrear, setFormCrear] = useState<FormCrear>(VACIO_CREAR);

  const [ingredienteEditar, setIngredienteEditar] = useState<Ingrediente | null>(null);
  const [formEditar, setFormEditar] = useState<FormEditar>({ nombre: "", es_alergeno: false, stock_cantidad: 0 });

  const params = {
    nombre: filtroNombre || undefined,
    es_alergeno: filtroAlergeno !== "" ? filtroAlergeno === "true" : undefined,
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  };

  const { data: ingredientes = [], isLoading } = useQuery({
    queryKey: ["ingredientes", params],
    queryFn: () => getIngredientes(params),
  });

  const { data: unidades = [] } = useQuery({
    queryKey: ["unidades-medida"],
    queryFn: getUnidadesMedida,
  });

  const crearMut = useMutation({
    mutationFn: (data: IngredienteCreate) => crearIngrediente(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ingredientes"] });
      qc.invalidateQueries({ queryKey: ["ingredientes-todos"] });
      setModalCrear(false);
      setFormCrear(VACIO_CREAR);
    },
    onError: (e: Error) => alert(e.message),
  });

  const editarMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: IngredienteUpdate }) =>
      editarIngrediente(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ingredientes"] });
      qc.invalidateQueries({ queryKey: ["ingredientes-todos"] });
      setIngredienteEditar(null);
    },
    onError: (e: Error) => alert(e.message),
  });

  const eliminarMut = useMutation({
    mutationFn: eliminarIngrediente,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ingredientes"] });
      qc.invalidateQueries({ queryKey: ["ingredientes-todos"] });
    },
    onError: (e: Error) => alert(e.message),
  });

  function abrirEditar(ing: Ingrediente) {
    setIngredienteEditar(ing);
    setFormEditar({
      nombre: ing.nombre,
      es_alergeno: ing.es_alergeno,
      stock_cantidad: ing.stock_cantidad,
    });
  }

  function submitCrear() {
    if (!formCrear.nombre.trim()) return alert("El nombre es obligatorio");
    if (formCrear.unidad_medida_id === "") return alert("Seleccioná una unidad de medida");
    if (formCrear.stock_cantidad < 0) return alert("El stock no puede ser negativo");
    crearMut.mutate({
      nombre: formCrear.nombre.trim(),
      unidad_medida_id: formCrear.unidad_medida_id as number,
      es_alergeno: formCrear.es_alergeno,
      stock_cantidad: formCrear.stock_cantidad,
    });
  }

  function submitEditar() {
    if (!ingredienteEditar) return;
    if (!formEditar.nombre.trim()) return alert("El nombre es obligatorio");
    if (formEditar.stock_cantidad < 0) return alert("El stock no puede ser negativo");
    editarMut.mutate({
      id: ingredienteEditar.id,
      data: {
        nombre: formEditar.nombre.trim(),
        es_alergeno: formEditar.es_alergeno,
        stock_cantidad: formEditar.stock_cantidad,
      },
    });
  }

  return (
    <div style={{ backgroundColor: "#1E2328", minHeight: "100vh" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 style={{ color: "#F1DFC8" }} className="text-2xl font-bold">
            Ingredientes
          </h1>
          <button
            onClick={() => setModalCrear(true)}
            className="px-4 py-2 rounded font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#C96A3D", color: "#F1DFC8" }}
          >
            + Nuevo ingrediente
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <input
            className="rounded px-3 py-2 text-sm"
            style={{ backgroundColor: "#2F5D62", color: "#F1DFC8", border: "1px solid #A6A29A" }}
            placeholder="Buscar por nombre..."
            value={filtroNombre}
            onChange={(e) => { setFiltroNombre(e.target.value); setPage(0); }}
          />
          <select
            className="rounded px-3 py-2 text-sm"
            style={{ backgroundColor: "#2F5D62", color: "#F1DFC8", border: "1px solid #A6A29A" }}
            value={filtroAlergeno}
            onChange={(e) => { setFiltroAlergeno(e.target.value as "" | "true" | "false"); setPage(0); }}
          >
            <option value="">Todos</option>
            <option value="true">Solo alérgenos</option>
            <option value="false">Sin alérgenos</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #A6A29A" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#2F5D62" }}>
                <th className="p-3 text-left" style={{ color: "#F1DFC8" }}>Nombre</th>
                <th className="p-3 text-left" style={{ color: "#F1DFC8" }}>Unidad</th>
                <th className="p-3 text-center" style={{ color: "#F1DFC8" }}>Stock</th>
                <th className="p-3 text-center" style={{ color: "#F1DFC8" }}>Alérgeno</th>
                <th className="p-3 text-center" style={{ color: "#F1DFC8" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center" style={{ color: "#A6A29A" }}>
                    Cargando...
                  </td>
                </tr>
              ) : ingredientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center" style={{ color: "#A6A29A" }}>
                    Sin ingredientes
                  </td>
                </tr>
              ) : (
                ingredientes.map((ing) => (
                  <tr
                    key={ing.id}
                    style={{ borderTop: "1px solid #A6A29A" }}
                    className="hover:brightness-110 transition-all"
                  >
                    <td className="p-3" style={{ color: "#F1DFC8" }}>
                      {ing.nombre}
                    </td>
                    <td className="p-3" style={{ color: "#A6A29A" }}>
                      {ing.unidad_medida_nombre}{" "}
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "#2F5D62", color: "#F1DFC8" }}
                      >
                        {ing.unidad_medida_simbolo}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono" style={{ color: "#F1DFC8" }}>
                      {ing.stock_cantidad}{" "}
                      <span style={{ color: "#A6A29A" }} className="text-xs">
                        {ing.unidad_medida_simbolo}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {ing.es_alergeno ? (
                        <span
                          className="text-xs px-2 py-0.5 rounded font-medium"
                          style={{ backgroundColor: "#7f1d1d", color: "#fca5a5" }}
                        >
                          ⚠️ Alérgeno
                        </span>
                      ) : (
                        <span style={{ color: "#A6A29A" }} className="text-xs">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => abrirEditar(ing)}
                          className="px-2 py-1 rounded text-xs hover:opacity-80"
                          style={{ backgroundColor: "#2F5D62", color: "#F1DFC8" }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar "${ing.nombre}"?`))
                              eliminarMut.mutate(ing.id);
                          }}
                          className="px-2 py-1 rounded text-xs hover:opacity-80"
                          style={{ backgroundColor: "#7f1d1d", color: "#fca5a5" }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex gap-3 mt-4 items-center justify-center">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 rounded text-sm disabled:opacity-30 hover:opacity-80"
            style={{ border: "1px solid #A6A29A", color: "#F1DFC8" }}
          >
            ← Anterior
          </button>
          <span style={{ color: "#A6A29A" }} className="text-sm">
            Página {page + 1}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={ingredientes.length < PAGE_SIZE}
            className="px-3 py-1 rounded text-sm disabled:opacity-30 hover:opacity-80"
            style={{ border: "1px solid #A6A29A", color: "#F1DFC8" }}
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Modal: Crear ingrediente */}
      {modalCrear && (
        <Modal titulo="Nuevo ingrediente" onClose={() => { setModalCrear(false); setFormCrear(VACIO_CREAR); }}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Nombre *</label>
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Ej: Harina de trigo"
                value={formCrear.nombre}
                onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Unidad de medida *
                <span className="text-xs text-gray-400 ml-1">(no se podrá cambiar después)</span>
              </label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={formCrear.unidad_medida_id}
                onChange={(e) =>
                  setFormCrear({ ...formCrear, unidad_medida_id: e.target.value ? parseInt(e.target.value) : "" })
                }
              >
                <option value="">Seleccioná una unidad...</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({u.simbolo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Stock inicial{" "}
                {formCrear.unidad_medida_id !== "" && (
                  <span className="text-xs font-medium text-blue-600">
                    ({unidades.find((u) => u.id === formCrear.unidad_medida_id)?.simbolo ?? ""})
                  </span>
                )}
              </label>
              <input
                className="border rounded px-3 py-2 w-full"
                type="number"
                min={0}
                step={0.01}
                value={formCrear.stock_cantidad || ""}
                onChange={(e) => setFormCrear({ ...formCrear, stock_cantidad: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formCrear.es_alergeno}
                onChange={(e) => setFormCrear({ ...formCrear, es_alergeno: e.target.checked })}
              />
              Es alérgeno
            </label>

            <button
              onClick={submitCrear}
              disabled={crearMut.isPending}
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-semibold mt-1"
            >
              {crearMut.isPending ? "Creando..." : "Crear ingrediente"}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal: Editar ingrediente */}
      {ingredienteEditar && (
        <Modal titulo="Editar ingrediente" onClose={() => setIngredienteEditar(null)}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Nombre *</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={formEditar.nombre}
                onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">Unidad de medida</label>
              <div
                className="border rounded px-3 py-2 text-sm flex items-center gap-2"
                style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
              >
                <span className="font-medium text-gray-700">
                  {ingredienteEditar.unidad_medida_nombre}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 font-mono">
                  {ingredienteEditar.unidad_medida_simbolo}
                </span>
                <span className="text-xs text-gray-400 ml-auto">No se puede cambiar</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Stock actual{" "}
                <span className="text-xs font-medium text-blue-600">
                  ({ingredienteEditar.unidad_medida_simbolo})
                </span>
              </label>
              <input
                className="border rounded px-3 py-2 w-full"
                type="number"
                min={0}
                step={0.01}
                value={formEditar.stock_cantidad || ""}
                onChange={(e) => setFormEditar({ ...formEditar, stock_cantidad: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formEditar.es_alergeno}
                onChange={(e) => setFormEditar({ ...formEditar, es_alergeno: e.target.checked })}
              />
              Es alérgeno
            </label>

            <button
              onClick={submitEditar}
              disabled={editarMut.isPending}
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-semibold mt-1"
            >
              {editarMut.isPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
