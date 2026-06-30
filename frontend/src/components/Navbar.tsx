import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthUser } from "../context/AuthContext";
import { menuItems, menuitems as todasLasOpciones} from "../models/OpcionesItems"


export default function BarraNavegacion(){
  const { user } = useAuthUser() 
  const [MenuDesplegable, setMenuDesplegable] = useState(false)
  const [items, setItems] = useState<menuItems[]>([])
  const navigate  = useNavigate()
  const logeado = true

  useEffect(()=>{
        const roles = user?.roles.map(rol => rol.codigo) ?? ["CLIENT"];
        const menuVisibles = todasLasOpciones.filter(item => roles?.some(rol => item.roles.includes(rol)));
        setItems(menuVisibles)
      }, [user])
  
  const obtenerEstilosEnlace = ({ isActive }: {isActive: boolean}) => `text-xl font-bold transition-all duration-200 hover:translate-x-2 ${isActive ? 'text-[#E63946]' : 'text-[#1E1E24]'}`;

  return (
    <>
    <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <button
            onClick={() => setMenuDesplegable(!MenuDesplegable)}
            className="flex flex-col justify-center items-center w-10 h-10 space-y-1.5 z-50 relative focus:outline-none"
            aria-label="Menu"
          >
            <span className={`block h-0.5 w-6 bg-[#1E1E24] transform transition duration-300 ease-in-out ${MenuDesplegable ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-6 bg-[#1E1E24] transition duration-300 ease-in-out ${MenuDesplegable ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-[#1E1E24] transform transition duration-300 ease-in-out ${MenuDesplegable ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>


          <div className={`fixed inset-0 z-40 transition-all duration-300 ${MenuDesplegable ? 'visible' : 'invisible'}`}>
            

            <div 
              className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${MenuDesplegable ? 'opacity-100' : 'opacity-0'}`}
              onClick={() => setMenuDesplegable(false)}
            />

            <nav className={`absolute left-0 top-0 h-full w-72 bg-white p-6 shadow-2xl flex flex-col space-y-6 pt-24 transform transition-transform duration-300 ease-in-out ${
              MenuDesplegable ? 'translate-x-0' : '-translate-x-full'
            }`}>
              {items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={obtenerEstilosEnlace}
                  onClick={() => setMenuDesplegable(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Botones de Usuario / Carrito */}
          <div className="flex items-center space-x-4">
            {/* Carrito */}
            <button onClick={()=>{navigate("/carrito")}} className="relative h-10 w-10 bg-[#E63946] text-white p-1 rounded-full hover:bg-opacity-90 transition-all flex items-center justify-center">
              {/* <svg xmlns="http://w3.org" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg> */}
              <div className='font-[iconsTwo]'>[</div>
              <span className="absolute -top-1 -right-1 bg-[#FFB703] text-[#1E1E24] font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                0
              </span>
            </button>
            
            {/* Login */}
            {logeado ? (
              <button className="hidden sm:flex items-center space-x-1 font-bold text-sm bg-[#1E1E24] text-white px-4 py-2.5 rounded-full hover:bg-opacity-90 transition-all" onClick={()=>{navigate("/login")}}>
              <svg xmlns="http://w3.org" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>User</span>
            </button>
            ) : (
              <button className="hidden sm:flex items-center space-x-1 font-bold text-sm bg-[#1E1E24] text-white px-4 py-2.5 rounded-full hover:bg-opacity-90 transition-all" onClick={()=>{navigate("/login")}}>
              <svg xmlns="http://w3.org" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Login/Registrarse</span>
            </button>
            )}
          </div>
        </div>
      </header>
    </>
  )
}