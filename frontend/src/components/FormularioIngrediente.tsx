import { useEffect, useState } from "react";
import { UnidadMedida } from "../models/UnidadMedida";


export default function IngredienteForm() {
    const [nombre, setNombre] = useState("");
    const [esAlergeno, setEsAlergeno] = useState(false);
    const [stockCantidad, setStockCantidad] = useState(0);
    const [unidadMedidaId, setUnidadMedidaId] = useState("");

    const [unidades, setUnidades] = useState<UnidadMedida[]>([]);

    useEffect(() => {
        const cargarUnidades = async () => {
            try {
                const response = await fetch("/api/unidades-medida");

                if (!response.ok) {
                    throw new Error(
                        "Error al cargar unidades de medida"
                    );
                }

                const data = await response.json();
                setUnidades(data);
            } catch (error) {
                console.error(error);
            }
        };

        cargarUnidades();
    }, []);

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const payload = {
            nombre,
            es_alergeno: esAlergeno,
            stock_cantidad: stockCantidad,
            unidad_medida_id: Number(unidadMedidaId),
        };

        try {
            const response = await fetch("/api/ingredientes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(
                    "Error al crear ingrediente"
                );
            }

            setNombre("");
            setEsAlergeno(false);
            setStockCantidad(0);
            setUnidadMedidaId("");

            console.log("Ingrediente creado");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex justify-center p-6">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-3xl rounded-xl border border-[#A6A29A]/20 bg-[#252B31] p-6 shadow-lg"
            >
                <h2 className="mb-6 text-2xl font-bold text-[#F1DFC8]">
                    Nuevo Ingrediente
                </h2>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm text-[#F1DFC8]">
                            Nombre
                        </label>

                        <input
                            type="text"
                            required
                            value={nombre}
                            onChange={(e) =>
                                setNombre(e.target.value)
                            }
                            className="w-full rounded-lg border border-[#A6A29A]/30 bg-[#1E2328] px-3 py-2 text-[#F1DFC8] focus:border-[#C96A3D] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-[#F1DFC8]">
                            Unidad de medida
                        </label>

                        <select
                            required
                            value={unidadMedidaId}
                            onChange={(e) =>
                                setUnidadMedidaId(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border border-[#A6A29A]/30 bg-[#1E2328] px-3 py-2 text-[#F1DFC8] focus:border-[#C96A3D] focus:outline-none"
                        >
                            <option value="">
                                Seleccionar
                            </option>

                            {unidades.map((unidad) => (
                                <option
                                    key={unidad.id}
                                    value={unidad.id}
                                >
                                    {unidad.simbolo}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-[#F1DFC8]">
                            Stock inicial
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={stockCantidad}
                            onChange={(e) =>
                                setStockCantidad(
                                    Number(e.target.value)
                                )
                            }
                            className="w-full rounded-lg border border-[#A6A29A]/30 bg-[#1E2328] px-3 py-2 text-[#F1DFC8] focus:border-[#C96A3D] focus:outline-none"
                        />
                    </div>

                    <div className="flex items-end">
                        <label className="flex items-center gap-3 text-[#F1DFC8]">
                            <input
                                type="checkbox"
                                checked={esAlergeno}
                                onChange={(e) =>
                                    setEsAlergeno(
                                        e.target.checked
                                    )
                                }
                                className="h-5 w-5 accent-[#C96A3D]"
                            />

                            Es alérgeno
                        </label>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        className="rounded-lg bg-[#C96A3D] px-6 py-2 font-medium text-white transition-colors hover:bg-[#2F5D62]"
                    >
                        Crear Ingrediente
                    </button>
                </div>
            </form>
        </div>
    );
}