import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategorias, crearCategoria, editarCategoria, eliminarCategoria } from "../api/api";
import { Categoria, CategoriaCreate } from "../types";
import Modal from "../components/Modal";

export default function CategoriasPage() {
  const queryClient = useQueryClient();
  const isAdmin = localStorage.getItem("role") === "admin";
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [form, setForm] = useState<CategoriaCreate>({ nombre: "", descripcion: "" });

  const { data: categorias, isLoading, isError } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  const crearMutation = useMutation({
    mutationFn: crearCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      cerrarModal();
    },
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaCreate }) => editarCategoria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      cerrarModal();
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categorias"] }),
  });

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setForm({ nombre: "", descripcion: "" });
  };

  const abrirEditar = (cat: Categoria) => {
    setEditando(cat);
    setForm({ nombre: cat.nombre, descripcion: cat.descripcion ?? "" });
    setModalAbierto(true);
  };

  const handleSubmit = () => {
    if (!form.nombre.trim()) return alert("El nombre es obligatorio");
    if (editando) {
      editarMutation.mutate({ id: editando.id, data: form });
    } else {
      crearMutation.mutate(form);
    }
  };

  if (isLoading) return <p className="p-6">Cargando...</p>;
  if (isError) return <p className="p-6 text-red-500">Error al cargar categorías</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
        {isAdmin && (
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nueva Categoría
          </button>
        )}
      </div>

      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">ID</th>
            <th className="text-left p-3">Nombre</th>
            <th className="text-left p-3">Descripción</th>
            <th className="text-left p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias?.map((cat) => (
            <tr key={cat.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{cat.id}</td>
              <td className="p-3">{cat.nombre}</td>
              <td className="p-3">{cat.descripcion ?? "-"}</td>
              <td className="p-3 flex gap-2">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => abrirEditar(cat)}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarMutation.mutate(cat.id)}
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
        <Modal titulo={editando ? "Editar Categoría" : "Nueva Categoría"} onClose={cerrarModal}>
          <div className="flex flex-col gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="Nombre *"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
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
