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