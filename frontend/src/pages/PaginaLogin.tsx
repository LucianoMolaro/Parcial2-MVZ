import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthUser } from '../context/AuthContext';
import { BsPersonCircle } from 'react-icons/bs';

export default function PaginaLogin() {
  const { login } = useAuthUser()
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const manejarIngreso = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password)
    navigate("/")
  };

  const irARegistro = () => {
    navigate('/registro');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased">
      
      {/* --- TARJETA DE LOGIN SUTIL --- */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100/80 shadow-md p-6 sm:p-8 space-y-6">
        
        {/* Encabezado / Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-transparent rounded-xl font-bold text-xl text-[#1E1E24] shadow-xs">
            <BsPersonCircle className='w-8 h-8'></BsPersonCircle>
          </div>
          <h1 className="text-xl font-extrabold text-[#1E1E24] tracking-tight">
            Ingresar
          </h1>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarIngreso} className="space-y-4">
          
          {/* Campo: Username */}
          <div className="space-y-1">
            <label htmlFor="username" className="block text-xs font-bold text-[#1E1E24] uppercase tracking-wider">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: juan_perez"
              className="w-full px-3 py-2 text-sm bg-[#FAFAFA] border border-gray-200 rounded-lg text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium"
            />
          </div>

          {/* Campo: Password */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-xs font-bold text-[#1E1E24] uppercase tracking-wider">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-[#FAFAFA] border border-gray-200 rounded-lg text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium"
            />
          </div>

          {/* Botones de Acción (Separación sutil con PT) */}
          <div className="space-y-2 pt-3">
            
            {/* Botón: Ingresar (Principal) */}
            <button
              onSubmit={()=>login}
              type="submit"
              className="w-full bg-[#E63946] hover:bg-opacity-95 text-white font-extrabold text-xs py-2.5 px-4 rounded-lg tracking-wider uppercase transition-all shadow-xs active:scale-98 focus:outline-none"
            >
              Ingresar
            </button>

            {/* Botón: Registrarse (Secundario sutil) */}
            <button
              type="button"
              onClick={irARegistro}
              className="w-full bg-[#FAFAFA] hover:bg-gray-100 text-[#1E1E24] border border-gray-200 font-bold text-xs py-2.5 px-4 rounded-lg tracking-wider uppercase transition-all focus:outline-none"
            >
              Registrarse
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}