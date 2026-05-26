import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="p-10 text-center">
      <h1 className="font-maxwell text-3xl text-gray-800 mb-2">BIENVENIDOS AL SISTEMA</h1>
      <p className="text-gray-500 mb-8">Integrador - Programación IV</p>
      <div className="flex justify-center gap-4">
        <Link to="/categorias" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Ver Categorías
        </Link>
        <Link to="/ingredientes" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
          Ver Ingredientes
        </Link>
        <Link to="/productos" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
          Ver Productos
        </Link>
      </div>
    </div>
  );
}
