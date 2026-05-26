import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIngredientes, crearIngrediente, editarIngrediente, eliminarIngrediente } from "../api/api";
import { Ingrediente, IngredienteCreate } from "../types";
import Modal from "../components/Modal";

export default function IngredientesPage() {
  const queryClient = useQueryClient();
  const isAdmin = localStorage.getItem("role") === "admin";
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Ingrediente | null>(null);
  const [form, setForm] = useState<IngredienteCreate>({ nombre: "", unidad: "" });

  const { data: ingredientes, isLoading, isError } = useQuery({
    queryKey: ["ingredientes"],
    queryFn: getIngredientes,
  });

  const crearMutation = useMutation({
    mutationFn: crearIngrediente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredientes"] });
      cerrarModal();
    },
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: IngredienteCreate }) => editarIngrediente(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredientes"] });
      cerrarModal();
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarIngrediente,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ingredientes"] }),
  });

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setForm({ nombre: "", unidad: "" });
  };

  const abrirEditar = (ing: Ingrediente) => {
    setEditando(ing);
    setForm({ nombre: ing.nombre, unidad: ing.unidad });
    setModalAbierto(true);
  };

  const handleSubmit = () => {
    if (!form.nombre.trim() || !form.unidad.trim()) return alert("Todos los campos son obligatorios");
    if (editando) {
      editarMutation.mutate({ id: editando.id, data: form });
    } else {
      crearMutation.mutate(form);
    }
  };

  if (isLoading) return <p className="p-6">Cargando...</p>;
  if (isError) return <p className="p-6 text-red-500">Error al cargar ingredientes</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Ingredientes</h1>
        {isAdmin && (
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nuevo Ingrediente
          </button>
        )}
      </div>

      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">ID</th>
            <th className="text-left p-3">Nombre</th>
            <th className="text-left p-3">Unidad</th>
            <th className="text-left p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ingredientes?.map((ing) => (
            <tr key={ing.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{ing.id}</td>
              <td className="p-3">{ing.nombre}</td>
              <td className="p-3">{ing.unidad}</td>
              <td className="p-3 flex gap-2">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => abrirEditar(ing)}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarMutation.mutate(ing.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalAbierto && (
        <Modal titulo={editando ? "Editar Ingrediente" : "Nuevo Ingrediente"} onClose={cerrarModal}>
          <div className="flex flex-col gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="Nombre *"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Unidad (ej: kg, litro, unidad) *"
              value={form.unidad}
              onChange={(e) => setForm({ ...form, unidad: e.target.value })}
            />
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {editando ? "Guardar cambios" : "Crear"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
