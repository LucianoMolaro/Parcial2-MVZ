import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIngredientes, crearIngrediente, editarIngrediente, eliminarIngrediente } from "../api/api";
import { Ingrediente, IngredienteCreate } from "../types";
import Modal from "../components/Modal";

const PAGE_SIZE = 7;
const EMPTY: IngredienteCreate = { nombre: "", unidad: "", es_alergeno: false, stock_cantidad: 0 };

export default function IngredientesPage() {
  const qc = useQueryClient();
  const rol = localStorage.getItem("rol") ?? "";
  const puedeModificar = rol === "ADMIN" || rol === "STOCK";

  const [page, setPage] = useState(0);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroAlergeno, setFiltroAlergeno] = useState<string>("");

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Ingrediente | null>(null);
  const [form, setForm] = useState<IngredienteCreate>(EMPTY);

  const params = {
    nombre: filtroNombre || undefined,
    es_alergeno: filtroAlergeno === "" ? undefined : filtroAlergeno === "true",
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  };

  const { data: ingredientes = [], isLoading } = useQuery({
    queryKey: ["ingredientes", params],
    queryFn: () => getIngredientes(params),
  });

  const crearMut = useMutation({
    mutationFn: crearIngrediente,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ingredientes"] }); cerrar(); },
  });

  const editarMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: IngredienteCreate }) => editarIngrediente(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ingredientes"] }); cerrar(); },
  });

  const eliminarMut = useMutation({
    mutationFn: eliminarIngrediente,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ingredientes"] }),
  });

  function cerrar() {
    setModal(false);
    setEditando(null);
    setForm(EMPTY);
  }

  function abrirEditar(ing: Ingrediente) {
    setEditando(ing);
    setForm({ nombre: ing.nombre, unidad: ing.unidad, es_alergeno: ing.es_alergeno, stock_cantidad: ing.stock_cantidad });
    setModal(true);
  }

  function handleSubmit() {
    if (!form.nombre.trim() || !form.unidad.trim()) return alert("Nombre y unidad son obligatorios");
    if (editando) editarMut.mutate({ id: editando.id, data: form });
    else crearMut.mutate(form);
  }

  function buscar() { setPage(0); }

  if (isLoading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Ingredientes</h1>
        {puedeModificar && (
          <button onClick={() => setModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Nuevo
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          className="border rounded px-3 py-1"
          placeholder="Buscar nombre..."
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
        />
        <select
          className="border rounded px-3 py-1"
          value={filtroAlergeno}
          onChange={(e) => setFiltroAlergeno(e.target.value)}
        >
          <option value="">Todos (alérgeno)</option>
          <option value="true">Solo alérgenos</option>
          <option value="false">No alérgenos</option>
        </select>
        <button onClick={buscar} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
          Buscar
        </button>
      </div>

      <table className="w-full border border-gray-200 rounded overflow-hidden text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Unidad</th>
            <th className="p-2 text-left">Alérgeno</th>
            <th className="p-2 text-left">Stock</th>
            {puedeModificar && <th className="p-2 text-left">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {ingredientes.map((ing: Ingrediente) => (
            <tr key={ing.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{ing.id}</td>
              <td className="p-2">{ing.nombre}</td>
              <td className="p-2">{ing.unidad}</td>
              <td className="p-2">{ing.es_alergeno ? "✓" : "-"}</td>
              <td className="p-2">{ing.stock_cantidad}</td>
              {puedeModificar && (
                <td className="p-2 flex gap-1">
                  <button onClick={() => abrirEditar(ing)} className="bg-yellow-400 text-white px-2 py-0.5 rounded text-xs hover:bg-yellow-500">
                    Editar
                  </button>
                  {rol === "ADMIN" && (
                    <button onClick={() => eliminarMut.mutate(ing.id)} className="bg-red-500 text-white px-2 py-0.5 rounded text-xs hover:bg-red-600">
                      Eliminar
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
          {ingredientes.length === 0 && (
            <tr><td colSpan={6} className="p-4 text-center text-gray-400">Sin resultados</td></tr>
          )}
        </tbody>
      </table>

      <div className="flex gap-2 mt-4 items-center">
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">
          ← Anterior
        </button>
        <span className="text-sm text-gray-600">Página {page + 1}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={ingredientes.length < PAGE_SIZE} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">
          Siguiente →
        </button>
      </div>

      {modal && (
        <Modal titulo={editando ? "Editar Ingrediente" : "Nuevo Ingrediente"} onClose={cerrar}>
          <div className="flex flex-col gap-3">
            <input className="border rounded px-3 py-2" placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <input className="border rounded px-3 py-2" placeholder="Unidad (ej: kg, litros) *" value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} />
            <input className="border rounded px-3 py-2" type="number" placeholder="Stock inicial" value={form.stock_cantidad} onChange={(e) => setForm({ ...form, stock_cantidad: parseFloat(e.target.value) || 0 })} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.es_alergeno} onChange={(e) => setForm({ ...form, es_alergeno: e.target.checked })} />
              Es alérgeno
            </label>
            <button onClick={handleSubmit} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              {editando ? "Guardar cambios" : "Crear"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
