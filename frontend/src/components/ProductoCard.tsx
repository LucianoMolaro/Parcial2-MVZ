import { ProductoPublic } from "../models/Producto";

interface ProductCardProps {
  producto: ProductoPublic;
}

export default function ProductCard({ producto }: ProductCardProps) {
  return (
    <div style={{ backgroundColor: '#1E2328' }} className="flex items-center gap-4 p-4 rounded-lg border border-[#A6A29A] w-full">
      
      <div className="flex-1">
        <h3 style={{ color: '#F1DFC8' }} className="text-lg font-semibold mb-2">
          {producto.nombre}
        </h3>
        <p style={{ color: '#A6A29A' }} className="text-sm mb-4 leading-tight">
          {producto.descripcion}
        </p>
        <p style={{ color: '#F1DFC8' }} className="text-2xl font-bold mb-4">
          ${producto.precio}
        </p>
        <button
          style={{
            backgroundColor: '#C96A3D',
            color: '#F1DFC8'
          }}
          className="w-full py-2 px-4 rounded font-medium hover:opacity-90 transition-opacity"
        >
          Agregar
        </button>
      </div>

      <div className="flex-shrink-0">
        <img
          src=""
          alt={producto.nombre}
          className="w-32 h-32 rounded object-cover"
        />
      </div>
    </div>
  );
}