import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex gap-6 items-center shadow">
      <span className="font-maxwell font-bold">Prog IV - Parcial 1</span>
      <Link to="/" className="hover:underline">Inicio</Link>
      <Link to="/categorias" className="hover:underline">Categorías</Link>
      <Link to="/ingredientes" className="hover:underline">Ingredientes</Link>
      <Link to="/productos" className="hover:underline">Productos</Link>
      <button
        onClick={handleLogout}
        className="ml-auto bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-sm"
      >
        Cerrar sesión
      </button>
    </nav>
  );
}
