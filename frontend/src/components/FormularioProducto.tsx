import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategorias, getIngredientes, crearProducto, editarProducto, subirImagenProducto } from "../api/api";
import { Producto, ProductoCreate } from "../types";
import Modal from "./Modal";

interface Props {
  producto?: Producto | null;
  onClose: () => void;
}

const VACIO: ProductoCreate = {
  nombre: "",
  precio: 0,
  descripcion: "",
  disponible: true,
  stock_cantidad: 0,
  categoria_ids: [],
  ingredientes: [],
};

export default function FormularioProducto({ producto, onClose }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState<ProductoCreate>(
    producto
      ? {
          nombre: producto.nombre,
          precio: producto.precio,
          descripcion: producto.descripcion ?? "",
          disponible: producto.disponible,
          stock_cantidad: producto.stock_cantidad,
          categoria_ids: producto.categorias.map((c) => c.id),
          ingredientes: producto.ingredientes.map((i) => ({
            ingrediente_id: i.ingrediente_id,
            cantidad: i.cantidad,
          })),
        }
      : VACIO
  );

  const fileRef = useRef<HTMLInputElement>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(producto?.imagen_url ?? null);

  const imagenMut = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      subirImagenProducto(id, file),
    onSuccess: (updated) => {
      setImagenPreview(updated.imagen_url ?? null);
      qc.invalidateQueries({ queryKey: ["productos"] });
    },
  });

  function handleImagenChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !producto) return;
    imagenMut.mutate({ id: producto.id, file });
  }

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias-todas"],
    queryFn: () => getCategorias({ limit: 100 }),
  });

  const { data: ingredientes = [] } = useQuery({
    queryKey: ["ingredientes-todos"],
    queryFn: () => getIngredientes({ limit: 100 }),
  });
  console.log(categorias);

  const crearMut = useMutation({
    mutationFn: crearProducto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["productos"] });
      onClose();
    },
  });

  const editarMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoCreate }) =>
      editarProducto(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["productos"] });
      onClose();
    },
  });

  function toggleCategoria(id: number) {
  console.log("toggle", id);

  setForm((f) => ({
    ...f,
    categoria_ids: f.categoria_ids.includes(id)
      ? f.categoria_ids.filter((c) => c !== id)
      : [...f.categoria_ids, id],
  }));
}

  function setIngredienteCantidad(ingrediente_id: number, raw: string) {
    const cantidad = parseFloat(raw) || 0;
    setForm((f) => {
      const existe = f.ingredientes.find((i) => i.ingrediente_id === ingrediente_id);
      if (cantidad <= 0) {
        return { ...f, ingredientes: f.ingredientes.filter((i) => i.ingrediente_id !== ingrediente_id) };
      }
      if (existe) {
        return {
          ...f,
          ingredientes: f.ingredientes.map((i) =>
            i.ingrediente_id === ingrediente_id ? { ...i, cantidad } : i
          ),
        };
      }
      return { ...f, ingredientes: [...f.ingredientes, { ingrediente_id, cantidad }] };
    });
  }

  function handleSubmit() {
    if (!form.nombre.trim()) return alert("El nombre es obligatorio");
    if (form.precio <= 0) return alert("El precio debe ser mayor a 0");
    const data: ProductoCreate = {
      ...form,
      descripcion: form.descripcion?.trim() || undefined,
    };
    if (producto) editarMut.mutate({ id: producto.id, data });
    else crearMut.mutate(data);
  }

  const pending = crearMut.isPending || editarMut.isPending;

  return (
    <Modal titulo={producto ? "Editar Producto" : "Nuevo Producto"} onClose={onClose}>
      <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
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
          min={0}
          step={0.01}
          value={form.precio || ""}
          onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })}
        />

        <textarea
          className="border rounded px-3 py-2"
          placeholder="Descripción"
          rows={2}
          value={form.descripcion ?? ""}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Stock inicial</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              min={0}
              step={0.01}
              value={form.stock_cantidad || ""}
              onChange={(e) => setForm({ ...form, stock_cantidad: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={form.disponible}
              onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
            />
            Disponible
          </label>
        </div>

        {categorias.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-1">Categorías</p>
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-1 text-sm border rounded px-2 py-1 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={form.categoria_ids.includes(c.id)}
                    onChange={() => toggleCategoria(c.id)}
                  />
                  {c.nombre}
                </label>
              ))}
            </div>
          </div>
        )}

        {ingredientes.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-1">Ingredientes (cantidad)</p>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto border rounded p-2">
              {ingredientes.map((ing) => {
                const actual = form.ingredientes.find((i) => i.ingrediente_id === ing.id);
                return (
                  <div key={ing.id} className="flex items-center justify-between text-sm py-0.5">
                    <span>
                      {ing.nombre}
                      {ing.es_alergeno && <span className="text-red-500 ml-1 text-xs">⚠️</span>}
                    </span>
                    <input
                      type="number"
                      className="border rounded w-20 px-2 py-0.5 text-right text-sm"
                      placeholder="0"
                      min={0}
                      step={0.01}
                      value={actual?.cantidad ?? ""}
                      onChange={(e) => setIngredienteCantidad(ing.id, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {producto && (
          <div>
            <p className="text-sm font-semibold mb-1">Imagen del producto</p>
            {imagenPreview && (
              <img
                src={imagenPreview}
                alt="preview"
                className="w-24 h-24 object-cover rounded mb-2"
              />
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagenChange}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={imagenMut.isPending}
              className="text-sm border rounded px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
            >
              {imagenMut.isPending ? "Subiendo..." : imagenPreview ? "Cambiar imagen" : "Subir imagen"}
            </button>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={pending}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-semibold mt-1"
        >
          {pending ? "Guardando..." : producto ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </Modal>
  );
}
