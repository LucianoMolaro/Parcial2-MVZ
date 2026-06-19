<<<<<<< HEAD
import { useEffect, useState } from "react";

interface Categoria {
    id: number;
    nombre: string;
}

interface Ingrediente {
    id: number;
    nombre: string;
}

interface ProductoCategoriaForm {
    categoriaId: number;
    esPrincipal: boolean;
}

interface ProductoIngredienteForm {
    ingredienteId: number;
    cantidad: number;
    esRemovible: boolean;
}

export default function ProductoForm() {
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState<number>(0);
    const [descripcion, setDescripcion] = useState("");
    const [stockCantidad, setStockCantidad] = useState<number>(0);
    const [disponible, setDisponible] = useState(true);
    const [habilitado, setHabilitado] = useState(true);

    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);

    const [productoCategorias, setProductoCategorias] = useState<
        ProductoCategoriaForm[]
    >([]);

    const [productoIngredientes, setProductoIngredientes] = useState<
        ProductoIngredienteForm[]
    >([]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [categoriasRes, ingredientesRes] =
                    await Promise.all([
                        fetch("/api/categorias"),
                        fetch("/api/ingredientes"),
                    ]);

                const categoriasData =
                    await categoriasRes.json();

                const ingredientesData =
                    await ingredientesRes.json();

                setCategorias(categoriasData);
                setIngredientes(ingredientesData);
            } catch (error) {
                console.error(error);
            }
        };

        cargarDatos();
    }, []);

    const agregarCategoria = () => {
        setProductoCategorias((prev) => [
            ...prev,
            {
                categoriaId: 0,
                esPrincipal: prev.length === 0,
            },
        ]);
    };

    const eliminarCategoria = (index: number) => {
        setProductoCategorias((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    const agregarIngrediente = () => {
        setProductoIngredientes((prev) => [
            ...prev,
            {
                ingredienteId: 0,
                cantidad: 0,
                esRemovible: false,
            },
        ]);
    };

    const eliminarIngrediente = (index: number) => {
        setProductoIngredientes((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const payload = {
            nombre,
            precio,
            descripcion: descripcion || null,
            stock_cantidad: stockCantidad,
            disponible,
            habilitado,
            categorias: productoCategorias,
            ingredientes: productoIngredientes,
        };

        try {
            const response = await fetch("/api/productos", {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(
                    "Error al crear producto"
                );
            }

            console.log("Producto creado");

            setNombre("");
            setPrecio(0);
            setDescripcion("");
            setStockCantidad(0);
            setDisponible(true);
            setHabilitado(true);
            setProductoCategorias([]);
            setProductoIngredientes([]);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex justify-center p-6">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-5xl rounded-xl border border-[#A6A29A]/20 bg-[#252B31] p-6 shadow-lg"
            >
                <h2 className="mb-6 text-2xl font-bold text-[#F1DFC8]">
                    Nuevo Producto
                </h2>

                {/* Datos básicos */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-[#F1DFC8]">
                            Nombre
                        </label>

                        <input
                            type="text"
                            required
                            value={nombre}
                            onChange={(e) =>
                                setNombre(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border border-[#A6A29A]/30 bg-[#1E2328] px-3 py-2 text-[#F1DFC8] focus:border-[#C96A3D] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-[#F1DFC8]">
                            Precio
                        </label>

                        <input
                            type="number"
                            required
                            min={0}
                            step={0.01}
                            value={precio}
                            onChange={(e) =>
                                setPrecio(
                                    Number(
                                        e.target.value
                                    )
                                )
                            }
                            className="w-full rounded-lg border border-[#A6A29A]/30 bg-[#1E2328] px-3 py-2 text-[#F1DFC8] focus:border-[#C96A3D] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-[#F1DFC8]">
                            Stock inicial
                        </label>

                        <input
                            type="number"
                            min={0}
                            value={stockCantidad}
                            onChange={(e) =>
                                setStockCantidad(
                                    Number(
                                        e.target.value
                                    )
                                )
                            }
                            className="w-full rounded-lg border border-[#A6A29A]/30 bg-[#1E2328] px-3 py-2 text-[#F1DFC8] focus:border-[#C96A3D] focus:outline-none"
                        />
                    </div>

                    <div className="flex items-end gap-6">
                        <label className="flex items-center gap-2 text-[#F1DFC8]">
                            <input
                                type="checkbox"
                                checked={disponible}
                                onChange={(e) =>
                                    setDisponible(
                                        e.target.checked
                                    )
                                }
                                className="accent-[#C96A3D]"
                            />
                            Disponible
                        </label>

                        <label className="flex items-center gap-2 text-[#F1DFC8]">
                            <input
                                type="checkbox"
                                checked={habilitado}
                                onChange={(e) =>
                                    setHabilitado(
                                        e.target.checked
                                    )
                                }
                                className="accent-[#C96A3D]"
                            />
                            Habilitado
                        </label>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="mb-2 block text-[#F1DFC8]">
                        Descripción
                    </label>

                    <textarea
                        rows={3}
                        value={descripcion}
                        onChange={(e) =>
                            setDescripcion(
                                e.target.value
                            )
                        }
                        className="w-full rounded-lg border border-[#A6A29A]/30 bg-[#1E2328] px-3 py-2 text-[#F1DFC8] focus:border-[#C96A3D] focus:outline-none"
                    />
                </div>

                {/* Categorías */}
                <div className="mt-8">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-[#F1DFC8]">
                            Categorías
                        </h3>

                        <button
                            type="button"
                            onClick={agregarCategoria}
                            className="rounded-lg bg-[#2F5D62] px-3 py-2 text-white hover:bg-[#23494d]"
                        >
                            + Agregar categoría
                        </button>
                    </div>

                    <div className="space-y-3">
                        {productoCategorias.map(
                            (categoria, index) => (
                                <div
                                    key={index}
                                    className="grid gap-3 md:grid-cols-[1fr_auto_auto]"
                                >
                                    <select
                                        value={
                                            categoria.categoriaId
                                        }
                                        onChange={(
                                            e
                                        ) => {
                                            const copia =
                                                [
                                                    ...productoCategorias,
                                                ];

                                            copia[
                                                index
                                            ].categoriaId =
                                                Number(
                                                    e
                                                        .target
                                                        .value
                                                );

                                            setProductoCategorias(
                                                copia
                                            );
                                        }}
                                        className="rounded-lg border border-[#A6A29A]/30 bg-[#1E2328] px-3 py-2 text-[#F1DFC8]"
                                    >
                                        <option value={0}>
                                            Seleccionar
                                            categoría
                                        </option>

                                        {categorias.map(
                                            (c) => (
                                                <option
                                                    key={
                                                        c.id
                                                    }
                                                    value={
                                                        c.id
                                                    }
                                                >
                                                    {
                                                        c.nombre
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <label className="flex items-center gap-2 text-[#F1DFC8]">
                                        <input
                                            type="radio"
                                            name="categoriaPrincipal"
                                            checked={
                                                categoria.esPrincipal
                                            }
                                            onChange={() =>
                                                setProductoCategorias(
                                                    productoCategorias.map(
                                                        (
                                                            c,
                                                            i
                                                        ) => ({
                                                            ...c,
                                                            esPrincipal:
                                                                i ===
                                                                index,
                                                        })
                                                    )
                                                )
                                            }
                                        />
                                        Principal
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            eliminarCategoria(
                                                index
                                            )
                                        }
                                        className="rounded-lg bg-red-600 px-3 py-2 text-white"
                                    >
                                        X
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Ingredientes */}
                <div className="mt-8">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-[#F1DFC8]">
                            Ingredientes
                        </h3>

                        <button
                            type="button"
                            onClick={agregarIngrediente}
                            className="rounded-lg bg-[#2F5D62] px-3 py-2 text-white hover:bg-[#23494d]"
                        >
                            + Agregar ingrediente
                        </button>
                    </div>

                    <div className="space-y-3">
                        {productoIngredientes.map(
                            (
                                ingrediente,
                                index
                            ) => (
                                <div
                                    key={index}
                                    className="grid gap-3 md:grid-cols-[2fr_1fr_auto_auto]"
                                >
                                    <select
                                        value={
                                            ingrediente.ingredienteId
                                        }
                                        onChange={(
                                            e
                                        ) => {
                                            const copia =
                                                [
                                                    ...productoIngredientes,
                                                ];

                                            copia[
                                                index
                                            ].ingredienteId =
                                                Number(
                                                    e
                                                        .target
                                                        .value
                                                );

                                            setProductoIngredientes(
                                                copia
                                            );
                                        }}
                                        className="rounded-lg border border-[#A6A29A]/30 bg-[#1E2328] px-3 py-2 text-[#F1DFC8]"
                                    >
                                        <option value={0}>
                                            Seleccionar
                                            ingrediente
                                        </option>

                                        {ingredientes.map(
                                            (i) => (
                                                <option
                                                    key={
                                                        i.id
                                                    }
                                                    value={
                                                        i.id
                                                    }
                                                >
                                                    {
                                                        i.nombre
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={
                                            ingrediente.cantidad
                                        }
                                        onChange={(
                                            e
                                        ) => {
                                            const copia =
                                                [
                                                    ...productoIngredientes,
                                                ];

                                            copia[
                                                index
                                            ].cantidad =
                                                Number(
                                                    e
                                                        .target
                                                        .value
                                                );

                                            setProductoIngredientes(
                                                copia
                                            );
                                        }}
                                        placeholder="Cantidad"
                                        className="rounded-lg border border-[#A6A29A]/30 bg-[#1E2328] px-3 py-2 text-[#F1DFC8]"
                                    />

                                    <label className="flex items-center gap-2 text-[#F1DFC8]">
                                        <input
                                            type="checkbox"
                                            checked={
                                                ingrediente.esRemovible
                                            }
                                            onChange={(
                                                e
                                            ) => {
                                                const copia =
                                                    [
                                                        ...productoIngredientes,
                                                    ];

                                                copia[
                                                    index
                                                ].esRemovible =
                                                    e.target.checked;

                                                setProductoIngredientes(
                                                    copia
                                                );
                                            }}
                                        />
                                        Removible
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            eliminarIngrediente(
                                                index
                                            )
                                        }
                                        className="rounded-lg bg-red-600 px-3 py-2 text-white"
                                    >
                                        X
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        className="rounded-lg bg-[#C96A3D] px-6 py-3 font-medium text-white transition hover:bg-[#2F5D62]"
                    >
                        Crear Producto
                    </button>
                </div>
            </form>
        </div>
    );
}
=======
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategorias, getIngredientes, crearProducto, editarProducto } from "../api/api";
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
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
