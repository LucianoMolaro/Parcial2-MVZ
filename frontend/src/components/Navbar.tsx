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
        
        <button
          onClick={() => setAbrir(true)}
          type="button"
          className="p-2 rounded-lg transition-colors flex-shrink-0"
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
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar..."
            value={busqueda}
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
 
      {/* OVERLAY */}
      {abrir && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300"
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
          </span>
          <button
            onClick={() => setAbrir(false)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#A6A29A' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(166, 162, 154, 0.1)'
              e.currentTarget.style.color = '#C96A3D'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#A6A29A'
            }}
          >
            <X size={16} />
          </button>
        </div>
 
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
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
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
              >
                <LogIn size={18} />
                Iniciar sesión
              </button>
              <button
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
              >
                <UserPlus size={18} />
                Registrarse
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
