import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../context/AuthContext";
import { Usuario } from "../models/Usuario";

<<<<<<< HEAD

function accesoDefinir(user: Usuario | null){
  const roles = user?.roles.map((rol) => rol.codigo)
  var acceso: string = ""
  if(roles?.includes("ADMIN")){
        acceso = "/listaUsuarios"
        return acceso
      }
  if(roles?.includes("STOCK")){
        acceso = "/ingredientes"
        return acceso
      }
=======
const LOGO_URL = 'https://tu-url-del-logo.com/logo.png'

function accesoDefinir(user: Usuario | null){
  const roles = user?.roles.map((rol) => rol.codigo)
  var acceso: string = "/"
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
  if(roles?.includes("PEDIDOS")){
        acceso = "/pedidos"
        return acceso
      }
<<<<<<< HEAD
  if(roles?.includes("CLIENT")){
        return "/productos"
      }
=======
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
  return acceso
}

export default function LoginPage() {
  const { login } = useAuthUser()
  const { user } = useAuthUser()

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password)
    navigate(accesoDefinir(user))
<<<<<<< HEAD
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "#1E2328" }}>

      <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "#C96A3D", opacity: 0.12, filter: "blur(60px)" }} />
      <div className="absolute bottom-[-60px] right-[-40px] w-56 h-56 rounded-full pointer-events-none"
        style={{ background: "#C96A3D", opacity: 0.08, filter: "blur(60px)" }} />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-4">
       
        <svg className="w-16 h-16 mb-6" viewBox="0 0 64 64" fill="none"
          stroke="#F1DFC8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 20 L12 8 H6" />
          <path d="M20 20 H54 L48 42 H24 L20 20Z" />
          <line x1="34" y1="20" x2="34" y2="8" />
          <line x1="28" y1="14" x2="40" y2="14" />
          <circle cx="26" cy="50" r="3" />
          <circle cx="46" cy="50" r="3" />
        </svg>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-3 mb-5">

       
          <div className="flex items-center gap-3 h-12 px-4 rounded-lg"
            style={{ background: "rgba(241,223,200,0.07)", border: "1px solid rgba(241,223,200,0.18)" }}>
            <svg width="18" height="18" stroke="rgba(241,223,200,0.4)" fill="none" strokeWidth="1.8">
              <circle cx="9" cy="6" r="3.5" /><path d="M1 17c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <input
              type="text"
              placeholder="USERNAME"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm tracking-widest uppercase"
              style={{ color: "#F1DFC8", fontWeight: 300 }}
            />
          </div>

          
          <div className="flex items-center gap-3 h-12 px-4 rounded-lg"
            style={{ background: "rgba(241,223,200,0.07)", border: "1px solid rgba(241,223,200,0.18)" }}>
            <svg width="18" height="18" stroke="rgba(241,223,200,0.4)" fill="none" strokeWidth="1.8">
=======
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password)
    navigate(accesoDefinir(user))
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#1E2328' }}
    >
      {/* Blobs decorativos */}
      <div 
        className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: '#C96A3D', opacity: 0.12, filter: 'blur(60px)' }} 
      />
      <div 
        className="absolute bottom-[-60px] right-[-40px] w-56 h-56 rounded-full pointer-events-none"
        style={{ background: '#C96A3D', opacity: 0.08, filter: 'blur(60px)' }} 
      />
 
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-4">
        
        {/* Logo o Icono */}
        <div className="mb-8 flex justify-center">
          <img 
            src={LOGO_URL} 
            alt="Logo" 
            className="h-16 object-contain"
            onError={(e) => {
              // Fallback: Mostrar icono de carrito si no carga la imagen
              e.currentTarget.style.display = 'none'
              const parent = e.currentTarget.parentElement
              if (parent) {
                const icon = document.createElement('div')
                icon.innerHTML = '<svg class="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="#C96A3D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20 L12 8 H6" /><path d="M20 20 H54 L48 42 H24 L20 20Z" /><line x1="34" y1="20" x2="34" y2="8" /><line x1="28" y1="14" x2="40" y2="14" /><circle cx="26" cy="50" r="3" /><circle cx="46" cy="50" r="3" /></svg>'
                parent.appendChild(icon)
              }
            }}
          />
        </div>
 
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4 mb-6">
          
          <div 
            className="flex items-center gap-3 h-12 px-4 rounded-lg transition-all"
            style={{ 
              background: 'rgba(201, 106, 61, 0.08)',
              border: '1px solid #A6A29A'
            }}
          >
            <svg width="18" height="18" stroke="#C96A3D" fill="none" strokeWidth="2">
              <circle cx="9" cy="6" r="3.5" />
              <path d="M1 17c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <input
              type="text"
              placeholder="USUARIO"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm tracking-widest uppercase placeholder:text-[#A6A29A]"
              style={{ 
                color: '#F1DFC8',
                fontWeight: 300,
              }}
            />
          </div>
 
          <div 
            className="flex items-center gap-3 h-12 px-4 rounded-lg transition-all"
            style={{ 
              background: 'rgba(201, 106, 61, 0.08)',
              border: '1px solid #A6A29A'
            }}
          >
            <svg width="18" height="18" stroke="#C96A3D" fill="none" strokeWidth="2">
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
              <rect x="3" y="8" width="12" height="9" rx="2" />
              <path d="M6 8V5.5a3 3 0 0 1 6 0V8" />
            </svg>
            <input
              type="password"
<<<<<<< HEAD
              placeholder="PASSWORD"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm tracking-widest uppercase"
              style={{ color: "#F1DFC8", fontWeight: 300 }}
            />
          </div>

          <button type="submit"
            className="h-12 rounded-lg text-xs font-medium tracking-widest uppercase transition-all active:scale-[0.98]"
            style={{ background: "#F1DFC8", color: "#1E2328" }}>
            Login
          </button>
        </form>

        <a href="#" className="text-xs tracking-wide transition-colors"
          style={{ color: "rgba(241,223,200,0.45)" }}>
          Forgot password?
        </a>
=======
              placeholder="CONTRASEÑA"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm tracking-widest uppercase"
              style={{ 
                color: '#F1DFC8',
                fontWeight: 300
              }}
            />
          </div>
 
          <button 
            onSubmit={handleLogin}
            className="h-12 rounded-lg text-xs font-medium tracking-widest uppercase transition-all active:scale-[0.98] hover:opacity-90"
            style={{ 
              background: '#C96A3D', 
              color: '#F1DFC8'
            }}
          >
            Iniciar Sesión
          </button>
        </form>
 
        <div className="w-full flex items-center gap-3 mb-6">
          <div style={{ height: '1px', flex: 1, backgroundColor: '#A6A29A' }} />
          <span style={{ color: '#A6A29A', fontSize: '0.75rem' }}>O</span>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#A6A29A' }} />
        </div>

        <button 
          type="button"
          className="w-full h-12 rounded-lg text-xs font-medium tracking-widest uppercase transition-all active:scale-[0.98] hover:opacity-90"
          style={{ 
            background: 'transparent',
            color: '#C96A3D',
            border: '1.5px solid #C96A3D'
          }}
        >
          Crear Cuenta
        </button>
 
        {/* Texto adicional */}
        <p 
          className="text-xs mt-6 text-center tracking-wide"
          style={{ color: '#A6A29A' }}
        >
          ¿No tienes cuenta? 
          <button 
            onClick={handleRegister}
            className="ml-1 transition-colors hover:opacity-80"
            style={{ color: '#C96A3D' }}
          >
            Regístrate aquí
          </button>
        </p>
>>>>>>> 963d90eee5cc139a2bc81ca319867c5edb30dfbb
      </div>
    </div>
  )
}

