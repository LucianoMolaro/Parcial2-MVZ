import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategorias, getCategoriasArbol,
  crearCategoria, editarCategoria, eliminarCategoria, reactivarCategoria,
} from "../api/api";
import { Categoria, CategoriaCreate, CategoriaTree } from "../types";
import Modal from "../components/Modal";

const PAGE_SIZE = 7;
const EMPTY: CategoriaCreate = { nombre: "", descripcion: "", parent_id: undefined };

function TreeNode({ node, nivel }: { node: CategoriaTree; nivel: number }) {
  const indent = nivel * 20;
  return (
    <div>
      <div style={{ paddingLeft: indent }} className="py-1 border-b text-sm text-gray-700">
        {nivel > 0 && <span className="text-gray-400 mr-1">└</span>}
        <span className="font-medium">{node.nombre}</span>
        {node.descripcion && <span className="text-gray-400 ml-2 text-xs">{node.descripcion}</span>}
      </div>
      {node.subcategorias.map((sub) => (
        <TreeNode key={sub.id} node={sub} nivel={nivel + 1} />
      ))}
    </div>
  );
}

export default function CategoriasPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroParent, setFiltroParent] = useState("");
  const [vistaArbol, setVistaArbol] = useState(false);

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [form, setForm] = useState<CategoriaCreate>(EMPTY);

  const params = {
    nombre: filtroNombre || undefined,
    parent_id: filtroParent === "raiz" ? undefined : filtroParent ? parseInt(filtroParent) : undefined,
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  };

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["categorias", params],
    queryFn: () => {
      // filtro "solo raíces"
      if (filtroParent === "raiz") {
        return getCategorias({ ...params, parent_id: 0 });
      }
      return getCategorias(params);
    },
  });

  const { data: arbol = [] } = useQuery({
    queryKey: ["categorias-arbol"],
    queryFn: getCategoriasArbol,
    enabled: vistaArbol,
  });

  // Para el selector de padre en el form
  const { data: todasCats = [] } = useQuery({
    queryKey: ["categorias-todas"],
    queryFn: () => getCategorias({ limit: 100 }),
  });

  const crearMut = useMutation({
    mutationFn: crearCategoria,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categorias"] }); qc.invalidateQueries({ queryKey: ["categorias-arbol"] }); cerrar(); },
  });
  const editarMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaCreate }) => editarCategoria(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categorias"] }); qc.invalidateQueries({ queryKey: ["categorias-arbol"] }); cerrar(); },
  });
  const eliminarMut = useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categorias"] }); qc.invalidateQueries({ queryKey: ["categorias-arbol"] }); },
  });
  const reactivarMut = useMutation({
    mutationFn: reactivarCategoria,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categorias"] }); qc.invalidateQueries({ queryKey: ["categorias-arbol"] }); },
  });

  function cerrar() { setModal(false); setEditando(null); setForm(EMPTY); }

  function abrirEditar(cat: Categoria) {
    setEditando(cat);
    setForm({ nombre: cat.nombre, descripcion: cat.descripcion ?? "", parent_id: cat.parent_id });
    setModal(true);
  }

  function handleSubmit() {
    if (!form.nombre.trim()) return alert("El nombre es obligatorio");
    const data = { ...form, parent_id: form.parent_id || undefined };
    if (editando) editarMut.mutate({ id: editando.id, data });
    else crearMut.mutate(data);
  }

  if (isLoading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <div className="flex gap-2">
          <button onClick={() => setVistaArbol(!vistaArbol)} className="border px-3 py-1 rounded hover:bg-gray-100 text-sm">
            {vistaArbol ? "Ver lista" : "Ver árbol"}
          </button>
          <button onClick={() => setModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Nueva
          </button>
        </div>
      </div>

      {vistaArbol ? (
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-3 text-gray-600">Árbol de categorías</h2>
          {arbol.map((n) => <TreeNode key={n.id} node={n} nivel={0} />)}
          {arbol.length === 0 && <p className="text-gray-400 text-sm">Sin categorías</p>}
        </div>
      ) : (
        <>
          {/* 2 filtros */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <input
              className="border rounded px-3 py-1"
              placeholder="Buscar nombre..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
            <select className="border rounded px-3 py-1" value={filtroParent} onChange={(e) => setFiltroParent(e.target.value)}>
              <option value="">Todas</option>
              <option value="raiz">Solo raíces (sin padre)</option>
              {todasCats.map((c) => <option key={c.id} value={c.id}>Hijas de: {c.nombre}</option>)}
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
                <th className="p-2 text-left">Descripción</th>
                <th className="p-2 text-left">Padre</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat: Categoria) => (
                <tr key={cat.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{cat.id}</td>
                  <td className="p-2">{cat.nombre}</td>
                  <td className="p-2 text-gray-500">{cat.descripcion ?? "-"}</td>
                  <td className="p-2 text-gray-500">
                    {cat.parent_id ? todasCats.find((c) => c.id === cat.parent_id)?.nombre ?? cat.parent_id : "-"}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <button onClick={() => abrirEditar(cat)} className="bg-yellow-400 text-white px-2 py-0.5 rounded text-xs hover:bg-yellow-500">
                        Editar
                      </button>
                      <button onClick={() => eliminarMut.mutate(cat.id)} className="bg-red-500 text-white px-2 py-0.5 rounded text-xs hover:bg-red-600">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categorias.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-gray-400">Sin resultados</td></tr>
              )}
            </tbody>
          </table>

          <div className="flex gap-2 mt-4 items-center">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">
              ← Anterior
            </button>
            <span className="text-sm text-gray-600">Página {page + 1}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={categorias.length < PAGE_SIZE} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">
              Siguiente →
            </button>
          </div>
        </>
      )}

      {modal && (
        <Modal titulo={editando ? "Editar Categoría" : "Nueva Categoría"} onClose={cerrar}>
          <div className="flex flex-col gap-3">
            <input className="border rounded px-3 py-2" placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <input className="border rounded px-3 py-2" placeholder="Descripción" value={form.descripcion ?? ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            <select className="border rounded px-3 py-2" value={form.parent_id ?? ""} onChange={(e) => setForm({ ...form, parent_id: e.target.value ? parseInt(e.target.value) : undefined })}>
              <option value="">Sin categoría padre (raíz)</option>
              {todasCats.filter((c) => !editando || c.id !== editando.id).map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <button onClick={handleSubmit} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              {editando ? "Guardar cambios" : "Crear"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
