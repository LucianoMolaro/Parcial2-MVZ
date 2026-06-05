import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../context/AuthContext";
import { Usuario } from "../models/Usuario";


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
  if(roles?.includes("PEDIDOS")){
        acceso = "/pedidos"
        return acceso
      }
  if(roles?.includes("CLIENT")){
        return "/productos"
      }
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
              <rect x="3" y="8" width="12" height="9" rx="2" />
              <path d="M6 8V5.5a3 3 0 0 1 6 0V8" />
            </svg>
            <input
              type="password"
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
      </div>
    </div>
  );
}

