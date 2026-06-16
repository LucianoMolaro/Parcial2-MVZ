import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import { useAuthUser } from "../context/AuthContext";
import ProductCard from "../components/ProductoCard";
import FormularioProducto from "../components/FormularioProducto";
import { getProductos, eliminarProducto } from "../api/api";
import { Producto } from "../types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 9;

export default function ProductosPage() {
  const { user } = useAuthUser();
  const esAdmin = user?.roles?.some((r) => r.codigo === "ADMIN") ?? false;
  const qc = useQueryClient();

  const [page, setPage] = useState(0);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const params = {
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    ...(esAdmin ? {} : { solo_disponibles: true }),
  };

  const { data: productos = [] } = useQuery({
    queryKey: ["productos", params],
    queryFn: () => getProductos(params),
    enabled: !!user,
  });

  const eliminarMut = useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productos"] }),
  });

  function abrirNuevo() {
    setProductoEditar(null);
    setModalAbierto(true);
  }

  function abrirEditar(p: Producto) {
    setProductoEditar(p);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setProductoEditar(null);
  }

  return (
    <div style={{ backgroundColor: "#1E2328", minHeight: "100vh" }}>
      <Navbar />

      {/* Carrusel de categorías */}
      <div style={{ backgroundColor: "#1E2328" }} className="w-full py-6 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-8">
          <button className="p-2 hover:opacity-70 transition-opacity">
            <ChevronLeft style={{ color: "#C96A3D" }} size={28} />
          </button>
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="w-16 h-16 rounded border-4 flex-shrink-0"
                style={{
                  backgroundColor: item === 1 ? "#C96A3D" : "transparent",
                  borderColor: "#C96A3D",
                }}
              />
            ))}
          </div>
          <button className="p-2 hover:opacity-70 transition-opacity">
            <ChevronRight style={{ color: "#C96A3D" }} size={28} />
          </button>
        </div>
      </div>

      {/* Botón admin */}
      {esAdmin && (
        <div className="max-w-7xl mx-auto px-8 pb-4 flex justify-end">
          <button
            onClick={abrirNuevo}
            className="px-4 py-2 rounded font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#C96A3D", color: "#F1DFC8" }}
          >
            + Nuevo producto
          </button>
        </div>
      )}

      {/* Grid de productos */}
      <div style={{ backgroundColor: "#1E2328" }} className="w-full pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-6">
            {productos.map((producto: Producto) => (
              <div key={producto.id} className="relative">
                <ProductCard producto={producto} />
                {esAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => abrirEditar(producto)}
                      className="bg-yellow-500 text-white text-xs px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar "${producto.nombre}"?`))
                          eliminarMut.mutate(producto.id);
                      }}
                      className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
            {productos.length === 0 && (
              <p style={{ color: "#A6A29A" }} className="col-span-3 text-center py-12">
                Sin productos disponibles
              </p>
            )}
          </div>

          {/* Paginación */}
          <div className="flex gap-4 mt-8 items-center justify-center">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 hover:opacity-70 transition-opacity disabled:opacity-30"
            >
              <ChevronLeft style={{ color: "#C96A3D" }} size={24} />
            </button>
            <span style={{ color: "#A6A29A" }} className="text-sm">
              Página {page + 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={productos.length < PAGE_SIZE}
              className="p-2 hover:opacity-70 transition-opacity disabled:opacity-30"
            >
              <ChevronRight style={{ color: "#C96A3D" }} size={24} />
            </button>
          </div>
        </div>
      </div>

      {modalAbierto && (
        <FormularioProducto producto={productoEditar} onClose={cerrarModal} />
      )}
    </div>
  );
}
