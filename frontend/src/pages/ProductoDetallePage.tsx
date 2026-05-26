import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProducto } from "../api/api";

export default function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>();

  const { data: producto, isLoading, isError } = useQuery({
    queryKey: ["producto", id],
    queryFn: () => getProducto(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <p className="p-6">Cargando...</p>;
  if (isError || !producto) return <p className="p-6 text-red-500">Producto no encontrado</p>;

  return (
    <div className="p-6 max-w-xl">
      <Link to="/productos" className="text-blue-600 hover:underline mb-4 block">&larr; Volver</Link>

      <div className="bg-white border rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{producto.nombre}</h1>
        <p className="text-gray-500 mb-4">{producto.descripcion ?? "Sin descripción"}</p>
        <p className="text-xl font-semibold text-green-600 mb-4">${producto.precio}</p>

        <div className="mb-3">
          <h2 className="font-bold text-gray-700">Categorías:</h2>
          {producto.categorias.length > 0 ? (
            <ul className="list-disc list-inside text-gray-600">
              {producto.categorias.map((c) => <li key={c.id}>{c.nombre}</li>)}
            </ul>
          ) : (
            <p className="text-gray-400">Sin categorías asignadas</p>
          )}
        </div>

        <div>
          <h2 className="font-bold text-gray-700">Ingredientes:</h2>
          {producto.ingredientes.length > 0 ? (
            <ul className="list-disc list-inside text-gray-600">
              {producto.ingredientes.map((i) => <li key={i.id}>{i.nombre} ({i.unidad})</li>)}
            </ul>
          ) : (
            <p className="text-gray-400">Sin ingredientes asignados</p>
          )}
        </div>
      </div>
    </div>
  );
}
