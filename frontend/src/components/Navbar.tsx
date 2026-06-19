<<<<<<< HEAD
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  LogOut,
  LogIn,
  UserPlus,
  ShoppingCart,
  Store,
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  Users,
  Package,
  Leaf,
  Tags,
  Ruler,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { useAuthUser } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { CodigoRol, tieneRol } from "../auth/roles";
import { colores } from "../theme";

interface ItemMenu {
  etiqueta: string;
  ruta: string;
  Icono: typeof Store;
  roles?: CodigoRol[];
}

const ITEMS: ItemMenu[] = [
  { etiqueta: "Catálogo", ruta: "/", Icono: Store },
  { etiqueta: "Dashboard", ruta: "/dashboard", Icono: LayoutDashboard, roles: ["ADMIN", "STOCK", "PEDIDOS"] },
  { etiqueta: "Pedidos", ruta: "/pedidos", Icono: ClipboardList, roles: ["ADMIN", "PEDIDOS"] },
  { etiqueta: "Mis pedidos", ruta: "/mis-pedidos", Icono: ShoppingBag, roles: ["CLIENT"] },
  { etiqueta: "Usuarios", ruta: "/usuarios", Icono: Users, roles: ["ADMIN"] },
  { etiqueta: "Productos / Stock", ruta: "/gestion-productos", Icono: Package, roles: ["ADMIN", "STOCK"] },
  { etiqueta: "Ingredientes", ruta: "/ingredientes", Icono: Leaf, roles: ["ADMIN", "STOCK"] },
  { etiqueta: "Categorías", ruta: "/categorias", Icono: Tags, roles: ["ADMIN"] },
];

export default function Navbar() {
  const [busqueda, setBusqueda] = useState("");
  const [abrir, setAbrir] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuthUser();
  const { cantidadTotal } = useCarrito();
  const searchRef = useRef<HTMLInputElement>(null);

  const isLoggedIn = !!user;
  const esCliente = tieneRol(user, "CLIENT");


  const itemsVisibles = ITEMS.filter(
    (item) => !item.roles || tieneRol(user, ...item.roles),
  );

  useEffect(() => {
    function handleAtajo(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleAtajo);
    return () => window.removeEventListener("keydown", handleAtajo);
  }, []);

  const irA = (ruta: string) => {
    navigate(ruta);
    setAbrir(false);
  };

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(busqueda.trim() ? `/?q=${encodeURIComponent(busqueda.trim())}` : "/");
  };

  const sidebarClase = abrir
    ? "fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 ease-in-out translate-x-0"
    : "fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 ease-in-out -translate-x-full";

  return (
    <>
      <nav
        className="w-full border-b shadow-sm px-6 py-4 flex items-center justify-between gap-8"
        style={{ backgroundColor: colores.fondo, borderColor: colores.gris }}
      >
=======
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { 
  Menu, 
  X, 
  Search, 
  BookOpen, 
  Users, 
  LogOut,
  LogIn,
  UserPlus,
  ShoppingCart
} from 'lucide-react'
import { useAuthUser } from '../context/AuthContext'

const LOGO_URL = '' 

export default function Navbar() {
  const [busqueda, setBusqueda] = useState('')
  const [abrir, setAbrir] = useState(false)
  const navigate = useNavigate()
  const [cartCount] = useState(0)
  const { logout, user } = useAuthUser() 
  const searchRef = useRef<HTMLInputElement>(null)

  const isLoggedIn = !!user
  const roles = user?.roles.map(rol => rol.codigo)

  useEffect(() => {
    function handleAtajo(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleAtajo)
    return () => window.removeEventListener('keydown', handleAtajo)
  }, [])

  const sidebarClase = abrir
    ? 'fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 ease-in-out translate-x-0'
    : 'fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 ease-in-out -translate-x-full'

  return (
    <>
      
      <nav 
        className="w-full border-b shadow-sm px-6 py-4 flex items-center justify-between gap-8"
        style={{ backgroundColor: '#1E2328', borderColor: '#A6A29A' }}
      >
        
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
        <button
          onClick={() => setAbrir(true)}
          type="button"
          className="p-2 rounded-lg transition-colors flex-shrink-0"
<<<<<<< HEAD
          style={{ color: colores.acento, backgroundColor: "transparent" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(201, 106, 61, 0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <Menu size={24} />
        </button>

        {/* LOGO */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 flex-shrink-0 transition-opacity hover:opacity-80"
        >
          <img
            src="./assets/images/Fondo.png"
            alt="Logo"
            className="h-8 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span
            className="text-lg font-bold tracking-wide"
            style={{ color: colores.crema, fontFamily: "Maxwell, sans-serif" }}
          >
            FOOD STORE
          </span>
        </button>

        <div className="flex-1" />

        {/* BUSCADOR */}
        <form
          onSubmit={buscar}
          className="flex items-center gap-3 rounded-full px-4 py-2.5 transition-all w-64"
          style={{ backgroundColor: "rgba(47, 93, 98, 0.6)", border: `1px solid ${colores.gris}` }}
        >
          <Search size={18} style={{ color: colores.acento }} className="shrink-0" />
=======
          style={{ 
            color: '#C96A3D',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(201, 106, 61, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Menu size={24} />
        </button>
 
        {/* LOGO */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 flex-shrink-0 transition-opacity hover:opacity-80"
        >
          <img 
            src="./assets/images/Fondo.png" 
            alt="Logo" 
            className="h-8 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </button>
 
 
 
        {/* SPACER */}
        <div className="flex-1" />
 
        {/* BUSCADOR */}
        <div 
          className="flex items-center gap-3 rounded-full px-4 py-2.5 transition-all w-64"
          style={{ 
            backgroundColor: 'rgba(47, 93, 98, 0.6)',
            border: '1px solid #A6A29A'
          }}
        >
          <Search size={18} style={{ color: '#C96A3D' }} className="shrink-0" />
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar..."
            value={busqueda}
<<<<<<< HEAD
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ backgroundColor: "transparent", color: colores.crema }}
            className="text-sm outline-none w-full placeholder:text-[#A6A29A]"
          />
        </form>

        {/* CARRITO (solo CLIENT) */}
        {esCliente && (
          <button
            onClick={() => navigate("/carrito")}
            className="relative p-2 rounded-lg transition-colors flex-shrink-0"
            style={{ color: colores.acento }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(201, 106, 61, 0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <ShoppingCart size={24} />
            {cantidadTotal > 0 && (
              <span
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ backgroundColor: colores.acento, color: colores.crema }}
              >
                {cantidadTotal}
              </span>
            )}
          </button>
        )}
      </nav>

=======
            onChange={e => setBusqueda(e.target.value)}
            style={{ 
              backgroundColor: 'transparent',
              color: '#F1DFC8',
            }}
            className="text-sm outline-none w-full placeholder:text-[#A6A29A]"
          />
        </div>
 
        {/* CARRITO */}
        <button
          onClick={() => navigate('/cliente')}
          className="relative p-2 rounded-lg transition-colors flex-shrink-0"
          style={{ color: '#C96A3D' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(201, 106, 61, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ShoppingCart size={24} />
          {cartCount > 0 && (
            <span
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
              style={{ backgroundColor: '#C96A3D', color: '#F1DFC8' }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </nav>
 
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
      {/* OVERLAY */}
      {abrir && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300"
<<<<<<< HEAD
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
          onClick={() => setAbrir(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={sidebarClase}
        style={{ backgroundColor: colores.fondo, borderRight: `1px solid ${colores.gris}` }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${colores.gris}` }}
        >
          <span
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: colores.gris }}
          >
            {user ? `${ROLNombre(user.roles?.[0]?.codigo)} · Menú` : "Menú"}
=======
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={() => setAbrir(false)}
        />
      )}
 
      {/* SIDEBAR MENÚ */}
      <aside 
        className={sidebarClase}
        style={{ 
          backgroundColor: '#1E2328',
          borderRight: '1px solid #A6A29A'
        }}
      >
        {/* Header Sidebar */}
        <div 
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #A6A29A' }}
        >
          <span 
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: '#A6A29A' }}
          >
            Menú
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
          </span>
          <button
            onClick={() => setAbrir(false)}
            className="p-1.5 rounded-lg transition-colors"
<<<<<<< HEAD
            style={{ color: colores.gris }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(166, 162, 154, 0.1)";
              e.currentTarget.style.color = colores.acento;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colores.gris;
=======
            style={{ color: '#A6A29A' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(166, 162, 154, 0.1)'
              e.currentTarget.style.color = '#C96A3D'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#A6A29A'
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
            }}
          >
            <X size={16} />
          </button>
        </div>
<<<<<<< HEAD

        {/* Ítems del menú según rol */}
        <div className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {itemsVisibles.map(({ etiqueta, ruta, Icono }) => (
            <button
              key={ruta}
              onClick={() => irA(ruta)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{ color: colores.crema }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colores.teal;
                e.currentTarget.style.color = colores.acento;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = colores.crema;
              }}
            >
              <Icono size={18} style={{ color: "inherit" }} />
              {etiqueta}
            </button>
          ))}
        </div>

        {/* Footer: sesión */}
        <div className="p-3" style={{ borderTop: `1px solid ${colores.gris}` }}>
          {isLoggedIn ? (
            <button
              onClick={() => {
                logout();
                setAbrir(false);
                navigate("/");
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{ color: colores.crema, backgroundColor: colores.acento }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colores.acentoHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colores.acento)}
=======
 
        {/* Menu Items */}
        <div className="flex-1 p-3 flex flex-col gap-1">
          <button
            onClick={() => {
              navigate('/')
              setAbrir(false)
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
            style={{ color: '#F1DFC8' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2F5D62'
              e.currentTarget.style.color = '#C96A3D'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#F1DFC8'
            }}
          >
            <BookOpen size={18} style={{ color: 'inherit' }} />
            Productos
          </button>
 
          {isLoggedIn && roles?.includes('CLIENT') && (
            <button
              onClick={() => {
                navigate('/cliente')
                setAbrir(false)
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{ color: '#F1DFC8' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2F5D62'
                e.currentTarget.style.color = '#C96A3D'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#F1DFC8'
              }}
            >
              <ShoppingCart size={18} style={{ color: 'inherit' }} />
              Tienda
            </button>
          )}

          {isLoggedIn && (roles?.includes('PEDIDOS') || roles?.includes('ADMIN')) && (
            <button
              onClick={() => {
                navigate('/pedidos')
                setAbrir(false)
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{ color: '#F1DFC8' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2F5D62'
                e.currentTarget.style.color = '#C96A3D'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#F1DFC8'
              }}
            >
              <BookOpen size={18} style={{ color: 'inherit' }} />
              Pedidos
            </button>
          )}

          {isLoggedIn && roles?.includes('ADMIN') && (
            <button
              onClick={() => {
                navigate('/categorias')
                setAbrir(false)
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{ color: '#F1DFC8' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2F5D62'
                e.currentTarget.style.color = '#C96A3D'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#F1DFC8'
              }}
            >
              <BookOpen size={18} style={{ color: 'inherit' }} />
              Categorías
            </button>
          )}

          {isLoggedIn && roles?.includes('ADMIN') && (
            <button
              onClick={() => {
                navigate('/usuarios')
                setAbrir(false)
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{ color: '#F1DFC8' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2F5D62'
                e.currentTarget.style.color = '#C96A3D'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#F1DFC8'
              }}
            >
              <Users size={18} style={{ color: 'inherit' }} />
              Usuarios
            </button>
          )}

          {isLoggedIn && (roles?.includes('STOCK') || roles?.includes('ADMIN')) && (
            <button
              onClick={() => {
                navigate('/ingredientes')
                setAbrir(false)
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{ color: '#F1DFC8' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2F5D62'
                e.currentTarget.style.color = '#C96A3D'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#F1DFC8'
              }}
            >
              <BookOpen size={18} style={{ color: 'inherit' }} />
              Ingredientes
            </button>
          )}
        </div>
 
        {/* Footer Sidebar */}
        <div 
          className="p-3"
          style={{ borderTop: '1px solid #A6A29A' }}
        >
          {isLoggedIn ? (
            <button
              onClick={() => {
                logout()
                setAbrir(false)
                navigate('/')
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{ 
                color: '#F1DFC8',
                backgroundColor: '#C96A3D'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A85A32'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C96A3D'}
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
<<<<<<< HEAD
                onClick={() => irA("/login")}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{ color: colores.crema, backgroundColor: colores.acento }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colores.acentoHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colores.acento)}
=======
                onClick={() => {
                  navigate('/login')
                  setAbrir(false)
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{ 
                  color: '#F1DFC8',
                  backgroundColor: '#C96A3D'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A85A32'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C96A3D'}
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
              >
                <LogIn size={18} />
                Iniciar sesión
              </button>
              <button
<<<<<<< HEAD
                onClick={() => irA("/registro")}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors border"
                style={{ color: colores.acento, backgroundColor: "transparent", borderColor: colores.acento }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(201, 106, 61, 0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
=======
                onClick={() => {
                  navigate('/registro')
                  setAbrir(false)
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors border"
                style={{ 
                  color: '#C96A3D',
                  backgroundColor: 'transparent',
                  borderColor: '#C96A3D'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(201, 106, 61, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
              >
                <UserPlus size={18} />
                Registrarse
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
<<<<<<< HEAD
  );
}

function ROLNombre(codigo?: string) {
  switch (codigo) {
    case "ADMIN":
      return "Administrador";
    case "STOCK":
      return "Inventario";
    case "PEDIDOS":
      return "Pedidos";
    case "CLIENT":
      return "Cliente";
    default:
      return "Invitado";
  }
}
=======
  )
}
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
