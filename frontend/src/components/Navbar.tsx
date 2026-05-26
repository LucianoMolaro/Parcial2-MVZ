import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rol = localStorage.getItem("rol") ?? "";

  const handleLogout = async () => {
    await fetch("http://localhost:8000/auth/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("rol");
    localStorage.removeItem("username");
    localStorage.removeItem("carrito");
    navigate("/login");
    window.location.reload();
  };

  const links: { to: string; label: string; roles: string[] }[] = [
    { to: "/catalogo",    label: "Catálogo",    roles: ["CLIENT"] },
    { to: "/pedidos",     label: "Pedidos",     roles: ["ADMIN", "PEDIDOS"] },
    { to: "/ingredientes", label: "Ingredientes", roles: ["ADMIN", "STOCK"] },
    { to: "/productos",   label: "Productos",   roles: ["ADMIN", "STOCK"] },
    { to: "/categorias",  label: "Categorías",  roles: ["ADMIN"] },
  ];

  const visibles = links.filter((l) => l.roles.includes(rol));

  return (
    <>
      <div className="bg-blue-700 text-white px-4 py-3 flex items-center gap-4 shadow">
        <button onClick={() => setOpen(!open)} className="text-xl font-bold w-8 h-8 flex items-center justify-center hover:bg-blue-600 rounded">
          ☰
        </button>
        <span className="font-bold">Prog IV</span>
        <span className="text-blue-300 text-sm ml-auto">{localStorage.getItem("username")} — {rol}</span>
      </div>

      {open && (
        <div className="fixed top-0 left-0 h-full w-52 bg-white shadow-lg z-50 flex flex-col">
          <div className="bg-blue-700 text-white px-4 py-3 font-bold flex justify-between items-center">
            <span>Menú</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>
          <nav className="flex-1 flex flex-col p-2 gap-1">
            {visibles.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="px-3 py-2 rounded hover:bg-blue-50 text-gray-800">
                {l.label}
              </Link>
            ))}
          </nav>
          <button onClick={handleLogout} className="m-3 bg-red-500 text-white py-2 rounded hover:bg-red-600">
            Cerrar sesión
          </button>
        </div>
      )}
      {open && <div className="fixed inset-0 z-40 bg-black bg-opacity-20" onClick={() => setOpen(false)} />}
    </>
  );
}
