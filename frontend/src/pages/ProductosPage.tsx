import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductos, getCategorias, getIngredientes,
  crearProducto, editarProducto, eliminarProducto,
  actualizarDisponibilidad, reactivarProducto,
} from "../api/api";
import { Producto, ProductoCreate, ProductoIngredienteInput } from "../types";
import Modal from "../components/Modal";

const PAGE_SIZE = 7;
const EMPTY: ProductoCreate = {
  nombre: "", precio: 0, descripcion: "", disponible: true,
  stock_cantidad: 0, categoria_ids: [], ingredientes: [],
};

export default function ProductosPage() {
  const qc = useQueryClient();
  const rol = localStorage.getItem("rol") ?? "";
  const puedeModificar = rol === "ADMIN" || rol === "STOCK";

  const [page, setPage] = useState(0);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroDisponible, setFiltroDisponible] = useState("");

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [form, setForm] = useState<ProductoCreate>(EMPTY);

  const params = {
    nombre: filtroNombre || undefined,
    categoria_id: filtroCategoria ? parseInt(filtroCategoria) : undefined,
    solo_disponibles: filtroDisponible === "true" ? true : undefined,
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  };

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ["productos", params],
    queryFn: () => getProductos(params),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias-todas"],
    queryFn: () => getCategorias({ limit: 100 }),
  });

  const { data: ingredientes = [] } = useQuery({
    queryKey: ["ingredientes-todos"],
    queryFn: () => getIngredientes({ limit: 100 }),
  });

  const crearMut = useMutation({
    mutationFn: crearProducto,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["productos"] }); cerrar(); },
  });
  const editarMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoCreate }) => editarProducto(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["productos"] }); cerrar(); },
  });
  const eliminarMut = useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productos"] }),
  });
  const reactivarMut = useMutation({
    mutationFn: reactivarProducto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productos"] }),
  });
  const stockMut = useMutation({
    mutationFn: ({ id, stock, disponible }: { id: number; stock: number; disponible: boolean }) =>
      actualizarDisponibilidad(id, { stock_cantidad: stock, disponible }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productos"] }),
  });

  function cerrar() { setModal(false); setEditando(null); setForm(EMPTY); }

  function abrirEditar(p: Producto) {
    setEditando(p);
    setForm({
      nombre: p.nombre, precio: p.precio, descripcion: p.descripcion ?? "",
      disponible: p.disponible, stock_cantidad: p.stock_cantidad,
      categoria_ids: p.categorias.map((c) => c.id),
      ingredientes: p.ingredientes.map((i) => ({ ingrediente_id: i.ingrediente_id, cantidad: i.cantidad })),
    });
    setModal(true);
  }

  function toggleCategoria(id: number) {
    setForm((f) => ({
      ...f,
      categoria_ids: f.categoria_ids.includes(id)
        ? f.categoria_ids.filter((x) => x !== id)
        : [...f.categoria_ids, id],
    }));
  }

  function setCantidadIngrediente(ingrediente_id: number, cantidad: number) {
    setForm((f) => {
      const existe = f.ingredientes.find((i) => i.ingrediente_id === ingrediente_id);
      if (existe) {
        if (cantidad <= 0) {
          return { ...f, ingredientes: f.ingredientes.filter((i) => i.ingrediente_id !== ingrediente_id) };
        }
        return { ...f, ingredientes: f.ingredientes.map((i) => i.ingrediente_id === ingrediente_id ? { ...i, cantidad } : i) };
      } else if (cantidad > 0) {
        return { ...f, ingredientes: [...f.ingredientes, { ingrediente_id, cantidad }] };
      }
      return f;
    });
  }

  function getCantidad(ingrediente_id: number): number {
    return form.ingredientes.find((i) => i.ingrediente_id === ingrediente_id)?.cantidad ?? 0;
  }

  function handleSubmit() {
    if (!form.nombre.trim()) return alert("El nombre es obligatorio");
    if (form.precio <= 0) return alert("El precio debe ser mayor a 0");
    if (editando) editarMut.mutate({ id: editando.id, data: form });
    else crearMut.mutate(form);
  }

  if (isLoading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        {puedeModificar && (
          <button onClick={() => setModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Nuevo
          </button>
        )}
      </div>

      {/* 3 filtros */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          className="border rounded px-3 py-1"
          placeholder="Buscar nombre..."
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
        />
        <select className="border rounded px-3 py-1" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <select className="border rounded px-3 py-1" value={filtroDisponible} onChange={(e) => setFiltroDisponible(e.target.value)}>
          <option value="">Todos (disponibilidad)</option>
          <option value="true">Solo disponibles</option>
        </select>
        <button onClick={() => setPage(0)} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
          Buscar
        </button>
      </div>

      <table className="w-full border border-gray-200 rounded overflow-hidden text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Precio</th>
            <th className="p-2 text-left">Stock</th>
            <th className="p-2 text-left">Disponible</th>
            <th className="p-2 text-left">Categorías</th>
            {puedeModificar && <th className="p-2 text-left">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {productos.map((p: Producto) => (
            <tr key={p.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{p.id}</td>
              <td className="p-2">{p.nombre}</td>
              <td className="p-2">${p.precio}</td>
              <td className="p-2">{p.stock_cantidad}</td>
              <td className="p-2">{p.disponible ? "✓" : "✗"}</td>
              <td className="p-2 text-gray-500 text-xs">{p.categorias.map((c) => c.nombre).join(", ") || "-"}</td>
              {puedeModificar && (
                <td className="p-2">
                  <div className="flex gap-1 flex-wrap">
                    <button onClick={() => abrirEditar(p)} className="bg-yellow-400 text-white px-2 py-0.5 rounded text-xs hover:bg-yellow-500">
                      Editar
                    </button>
                    <button
                      onClick={() => stockMut.mutate({ id: p.id, stock: p.stock_cantidad, disponible: !p.disponible })}
                      className="bg-purple-500 text-white px-2 py-0.5 rounded text-xs hover:bg-purple-600"
                    >
                      {p.disponible ? "Desactivar" : "Activar"}
                    </button>
                    <button onClick={() => eliminarMut.mutate(p.id)} className="bg-red-500 text-white px-2 py-0.5 rounded text-xs hover:bg-red-600">
                      Eliminar
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
          {productos.length === 0 && (
            <tr><td colSpan={7} className="p-4 text-center text-gray-400">Sin resultados</td></tr>
          )}
        </tbody>
      </table>

      <div className="flex gap-2 mt-4 items-center">
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">
          ← Anterior
        </button>
        <span className="text-sm text-gray-600">Página {page + 1}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={productos.length < PAGE_SIZE} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">
          Siguiente →
        </button>
      </div>

      {modal && (
        <Modal titulo={editando ? "Editar Producto" : "Nuevo Producto"} onClose={cerrar}>
          <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
            <input className="border rounded px-3 py-2" placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <input className="border rounded px-3 py-2" type="number" placeholder="Precio *" value={form.precio} onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })} />
            <input className="border rounded px-3 py-2" placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            <input className="border rounded px-3 py-2" type="number" placeholder="Stock" value={form.stock_cantidad} onChange={(e) => setForm({ ...form, stock_cantidad: parseInt(e.target.value) || 0 })} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.disponible} onChange={(e) => setForm({ ...form, disponible: e.target.checked })} />
              Disponible
            </label>

            <div>
              <p className="font-semibold mb-1">Categorías:</p>
              {categorias.map((c) => (
                <label key={c.id} className="flex items-center gap-2 mb-1">
                  <input type="checkbox" checked={form.categoria_ids.includes(c.id)} onChange={() => toggleCategoria(c.id)} />
                  {c.nombre}
                </label>
              ))}
            </div>

            <div>
              <p className="font-semibold mb-1">Ingredientes (ingresá la cantidad por unidad de producto):</p>
              {ingredientes.map((i) => (
                <div key={i.id} className="flex items-center gap-2 mb-1">
                  <span className="w-32 text-sm">{i.nombre} ({i.unidad})</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="border rounded px-2 py-0.5 w-24 text-sm"
                    value={getCantidad(i.id) || ""}
                    onChange={(e) => setCantidadIngrediente(i.id, parseFloat(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>

            <button onClick={handleSubmit} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              {editando ? "Guardar cambios" : "Crear"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
