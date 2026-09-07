import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthUser } from "../context/AuthContext";
import { BsBoxArrowRight, BsCart3, BsPerson } from 'react-icons/bs'
import { menuItems, menuitems as todasLasOpciones} from "../models/OpcionesItems"
import { useCarrito } from "../context/CarritoContext";

export default function BarraNavegacion(){
  const { user , logout } = useAuthUser() 
  const { state } = useCarrito()
  const [MenuDesplegable, setMenuDesplegable] = useState(false)
  const [items, setItems] = useState<menuItems[]>([])
  const navigate  = useNavigate()
  

  useEffect(()=>{
    let roles: string[];  
        if (!user) roles = ["GUEST"];
        else if (user.roles.length === 0) roles = ["CLIENT"];
        else roles = user.roles.map(rol => rol.codigo);
        const menuVisibles = todasLasOpciones.filter(item => roles.some(rol => item.roles.includes(rol)));
        setItems(menuVisibles)
      }, [user])
  
  const obtenerEstilosEnlace = ({ isActive }: {isActive: boolean}) => `text-xl font-bold transition-all duration-200 hover:translate-x-2 ${isActive ? 'text-[#E63946]' : 'text-[#1E1E24]'}`;

  function handleLogout(){
    logout()
    navigate("/")
  }
  
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
              {!!user && (<button
                className="w-full text-left text-xl font-extrabold justify-center text-[#1E1E24] hover:text-[#E63946] transition-all duration-200 hover:translate-x-2 pt-3 border-t border-gray-100 flex items-center space-x-2 cursor-pointer focus:outline-none"
                onClick={() => handleLogout()}
              >
                <span>Cerrar sesión</span>
              </button>)}
            </nav>
          </div>


          <div className="flex items-center space-x-4">
            {/* Carrito */}
            {user && user.roles.map(rol => rol.codigo).includes("CLIENTE") && (
              <button onClick={() => navigate("/carrito")} className="relative bg-[#E63946] text-white p-2 rounded-full hover:bg-opacity-90 transition-all flex items-center justify-center">
                <BsCart3 className="h-5 w-5"></BsCart3>
                <span className="absolute -top-1 -right-1 bg-[#FFB703] text-[#1E1E24] font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {state.totalUnidades}
                </span>
              </button>
            )}
            
            {/* Login */}
            {!!user ? (
              <button className="hidden sm:flex items-center space-x-1 font-bold text-sm bg-[#1E1E24] text-white px-4 py-2.5 rounded-full hover:bg-opacity-90 transition-all">
              <BsPerson className="w-5 h-5"></BsPerson>
              <span>{user.nombre}</span>
            </button>
            ) : (
              <button className="hidden sm:flex items-center space-x-1 font-bold text-sm bg-[#1E1E24] text-white px-4 py-2.5 rounded-full hover:bg-opacity-90 transition-all" onClick={()=>{navigate("/login")}}>
              <BsPerson className="w-5 h-5"></BsPerson>
              <span>Login/Registrarse</span>
            </button>
            )}
          </div>
        </div>
      </header>
    </>
  )
}