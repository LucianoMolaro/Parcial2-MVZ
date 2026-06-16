import { useEffect, useState } from "react";
import { ProductoPublic } from "../models/Producto";
import Navbar from "../components/Navbar";
import { useAuthUser } from "../context/AuthContext";
import ProductCard from "../components/ProductoCard";
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductosPage() {
    const [productos, setProductos] = useState<ProductoPublic[]>([])
    const [ page , setPage] = useState(1)
    const { user } = useAuthUser()
    const esAdmin = user?.roles?.some(r => r.codigo === "ADMIN") ?? false;

    useEffect(() => {
        if (!user) return;
        const cargarProductos = async () => {
          const res = await fetch(
            `http://localhost:8000/productos?es_admin=${esAdmin}&page=${page}`,
              {
                credentials: "include",
              }
          )
          if (res.ok) {
            const data: ProductoPublic[] = await res.json()
            setProductos(data)
          }
      }
      cargarProductos()
    }, [user, esAdmin, page])

     return (
        <div style={{ backgroundColor: '#1E2328', minHeight: '100vh' }}>
        <Navbar></Navbar>
        
        {/* Sección de Categorías */}
        <div style={{ backgroundColor: '#1E2328' }} className="w-full py-6 px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-8">
            <button className="p-2 hover:opacity-70 transition-opacity">
              <span style={{ color: '#C96A3D' }} className="text-3xl font-bold">&lt;</span>
            </button>
            
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="w-16 h-16 rounded border-4 flex-shrink-0"
                  style={{
                    backgroundColor: item === 1 ? '#C96A3D' : 'transparent',
                    borderColor: '#C96A3D'
                  }}
                />
              ))}
            </div>
            
            <button className="p-2 hover:opacity-70 transition-opacity">
              <span style={{ color: '#C96A3D' }} className="text-3xl font-bold">&gt;</span>
            </button>
          </div>
        </div>

        {/* Sección de Productos */}
        <div style={{ backgroundColor: '#1E2328' }} className="w-full py-12 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 gap-6">
                {productos.map(producto => (
                    <ProductCard key={producto.id} producto={producto} />
                ))}
            </div>
          </div>
        </div>
        </div>
    )
}
