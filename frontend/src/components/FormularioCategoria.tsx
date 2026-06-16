import { useEffect, useState } from "react";
import { Categoria } from "../models/Categoria";


const renderCategorias = (categorias: Categoria[],nivel = 0): React.ReactNode[] => {
        return categorias.flatMap((categoria) => [
            <option
                key={categoria.id}
                value={categoria.id}
            >
                {"—".repeat(nivel)} {categoria.nombre}
            </option>,

            ...(categoria.subcategorias
                ? renderCategorias(
                      categoria.subcategorias,
                      nivel + 1
                  )
                : []),
        ]);
    };

export default function CategoriaForm() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [parentId, setParentId] = useState<number | "">("");
    const [habilitado, setHabilitado] = useState(true);

    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const response = await fetch("/api/categorias");

                if (!response.ok) {
                    throw new Error("Error al cargar categorías");
                }

                const data = await response.json();
                setCategorias(data);
            } catch (error) {
                console.error(error);
            }
        };

        cargarCategorias();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            nombre,
            descripcion: descripcion || null,
            parent_id: parentId || null,
            habilitado,
        };

        try {
            const response = await fetch("/api/categorias", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Error al crear categoría");
            }

            console.log("Categoría creada");

            setNombre("");
            setDescripcion("");
            setParentId("");
            setHabilitado(true);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
        <div className="min-h-screen bg-[#1E2328] flex items-center justify-center p-6">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-lg bg-[#252B31] border border-[#A6A29A]/20 rounded-xl p-6 shadow-lg space-y-5"
            >
                <h2 className="text-2xl font-bold text-[#F1DFC8]">
                    Nueva Categoría
                </h2>

                <div>
                    <label className="block mb-2 text-[#F1DFC8]">
                        Nombre
                    </label>

                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        className="w-full rounded-lg border border-[#A6A29A]/30 bg-[#1E2328] px-3 py-2 text-[#F1DFC8] focus:border-[#C96A3D] focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block mb-2 text-[#F1DFC8]">
                        Descripción
                    </label>

                    <textarea
                        rows={3}
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        className="w-full rounded-lg border border-[#A6A29A]/30 bg-[#1E2328] px-3 py-2 text-[#F1DFC8] focus:border-[#C96A3D] focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block mb-2 text-[#F1DFC8]">
                        Categoría Padre
                    </label>

                    <select
                        value={parentId}
                        onChange={(e) =>
                            setParentId(
                                e.target.value
                                    ? Number(e.target.value)
                                    : ""
                            )
                        }
                        className="w-full rounded-lg border border-[#A6A29A]/30 bg-[#1E2328] px-3 py-2 text-[#F1DFC8] focus:border-[#C96A3D] focus:outline-none"
                    >
                        <option value="">
                            Sin categoría padre
                        </option>

                        {categorias.map((categoria) => (
                            <option
                                key={categoria.id}
                                value={categoria.id}
                            >
                                {categoria.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        id="habilitado"
                        type="checkbox"
                        checked={habilitado}
                        onChange={(e) =>
                            setHabilitado(e.target.checked)
                        }
                        className="h-4 w-4 accent-[#C96A3D]"
                    />

                    <label
                        htmlFor="habilitado"
                        className="text-[#F1DFC8]"
                    >
                        Habilitado
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full rounded-lg bg-[#C96A3D] py-2 font-medium text-white transition hover:bg-[#2F5D62]"
                >
                    Crear Categoría
                </button>
            </form>
        </div>
        </>
    );
}

