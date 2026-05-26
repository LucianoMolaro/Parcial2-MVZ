import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProductos, crearProducto, editarProducto, eliminarProducto, getCategorias, getIngredientes } from "../api/api";
import { Producto, ProductoCreate } from "../types";
import Modal from "../components/Modal";
import { Link } from "react-router-dom";

export default function ProductosPage() {
  const queryClient = useQueryClient();
  const isAdmin = localStorage.getItem("role") === "admin";

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [form, setForm] = useState<ProductoCreate>({
    nombre: "",
    precio: 0,
    descripcion: "",
    categoria_ids: [],
    ingrediente_ids: [],
  });

  const { data: productos, isLoading, isError } = useQuery({
    queryKey: ["productos"],
    queryFn: getProductos,
  });

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  const { data: ingredientes } = useQuery({
    queryKey: ["ingredientes"],
    queryFn: getIngredientes,
  });

  const crearMutation = useMutation({
    mutationFn: crearProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      cerrarModal();
    },
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoCreate }) => editarProducto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      cerrarModal();
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["productos"] }),
  });

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setForm({ nombre: "", precio: 0, descripcion: "", categoria_ids: [], ingrediente_ids: [] });
  };

  const abrirEditar = (p: Producto) => {
    setEditando(p);
    setForm({
      nombre: p.nombre,
      precio: p.precio,
      descripcion: p.descripcion ?? "",
      categoria_ids: p.categorias.map((c) => c.id),
      ingrediente_ids: p.ingredientes.map((i) => i.id),
    });
    setModalAbierto(true);
  };

  const toggleId = (ids: number[], id: number) =>
    ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];

  const handleSubmit = () => {
    if (!form.nombre.trim()) return alert("El nombre es obligatorio");
    if (form.precio <= 0) return alert("El precio debe ser mayor a 0");
    if (editando) {
      editarMutation.mutate({ id: editando.id, data: form });
    } else {
      crearMutation.mutate(form);
    }
  };

  if (isLoading) return <p className="p-6">Cargando...</p>;
  if (isError) return <p className="p-6 text-red-500">Error al cargar productos</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        {isAdmin && (
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nuevo Producto
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos?.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow border border-gray-200 p-4 flex flex-col gap-2">
            <h2 className="text-lg font-bold text-gray-800">{p.nombre}</h2>
            <p className="text-green-600 font-semibold text-xl">${p.precio}</p>
            {p.descripcion && <p className="text-gray-500 text-sm">{p.descripcion}</p>}

            {p.categorias.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {p.categorias.map((c) => (
                  <span key={c.id} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {c.nombre}
                  </span>
                ))}
              </div>
            )}

            {p.ingredientes.length > 0 && (
              <p className="text-gray-400 text-xs">
                Ingredientes: {p.ingredientes.map((i) => i.nombre).join(", ")}
              </p>
            )}

            <div className="flex gap-2 mt-2">
              <Link
                to={`/productos/${p.id}`}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
              >
                Ver
              </Link>
              {isAdmin && (
                <>
                  <button
                    onClick={() => abrirEditar(p)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarMutation.mutate(p.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <Modal titulo={editando ? "Editar Producto" : "Nuevo Producto"} onClose={cerrarModal}>
          <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
            <input
              className="border rounded px-3 py-2"
              placeholder="Nombre *"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2"
              type="number"
              placeholder="Precio *"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) })}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />

            <div>
              <p className="font-semibold mb-1">Categorías:</p>
              {categorias?.map((c) => (
                <label key={c.id} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={form.categoria_ids.includes(c.id)}
                    onChange={() => setForm({ ...form, categoria_ids: toggleId(form.categoria_ids, c.id) })}
                  />
                  {c.nombre}
                </label>
              ))}
            </div>

            <div>
              <p className="font-semibold mb-1">Ingredientes:</p>
              {ingredientes?.map((i) => (
                <label key={i.id} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={form.ingrediente_ids.includes(i.id)}
                    onChange={() => setForm({ ...form, ingrediente_ids: toggleId(form.ingrediente_ids, i.id) })}
                  />
                  {i.nombre} ({i.unidad})
                </label>
              ))}
            </div>

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
