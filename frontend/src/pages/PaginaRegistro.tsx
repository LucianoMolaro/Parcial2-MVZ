import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaginaRegistro() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const manejarRegistro = (e: React.FormEvent) => {
    e.preventDefault();

    const usuarioPayload = {
      nombre,
      apellido,
      email,
      celular: celular === '' ? null : celular, // Envía null si el opcional está vacío
      username,
      password_hash: password, 

    };

    console.log('Payload enviado a FastAPI:', usuarioPayload);
    alert('¡Cuenta creada con éxito! Bienvenido a la app.');
    navigate('/login'); // Redirección automática al login
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased">
      
      {/* --- TARJETA DE REGISTRO SUTIL Y COMPACTA --- */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100/80 shadow-md p-6 sm:p-8 space-y-5">
        
        {/* Encabezado / Identidad Visual */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-11 h-12 bg-[#FFB703] rounded-xl font-bold text-xl text-[#1E1E24] shadow-xs select-none">
            🍔
          </div>
          <h1 className="text-xl font-black text-[#1E1E24] tracking-tight">
            Crea tu <span className="text-[#E63946]">Cuenta</span>
          </h1>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarRegistro} className="space-y-3.5">
          
          {/* Fila Doble: Nombre y Apellido (max_length=80) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="nombre" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                required
                maxLength={80}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan"
                className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="apellido" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Apellido
              </label>
              <input
                id="apellido"
                type="text"
                required
                maxLength={80}
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej: Pérez"
                className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium"
              />
            </div>
          </div>

          {/* Campo: Email (unique=True, max_length=254) */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan.perez@example.com"
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium"
            />
          </div>

          {/* Campo: Celular (Opcional, max_length=20) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label htmlFor="celular" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Celular / Teléfono
              </label>
              <span className="text-[9px] font-bold text-gray-300 uppercase">Opcional</span>
            </div>
            <input
              id="celular"
              type="tel"
              maxLength={20}
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              placeholder="Ej: +54 9 261 123456"
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium"
            />
          </div>

          {/* Campo: Username (unique=True) */}
          <div className="space-y-1">
            <label htmlFor="username" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Nombre de Usuario
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: juan_perez99"
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium"
            />
          </div>

          {/* Campo: Password (Mapeado a password_hash en el back) */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAFAFA] border border-gray-100 rounded-xl text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium"
            />
          </div>

          {/* Botonera de Acciones (Jerarquía Sutil de colores) */}
          <div className="space-y-2 pt-2">
            {/* Botón Principal: Registrarse */}
            <button
              type="submit"
              className="w-full bg-[#E63946] hover:bg-opacity-95 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl tracking-wider uppercase transition-all shadow-xs active:scale-98 focus:outline-none cursor-pointer text-center"
            >
              Crear Cuenta
            </button>

            {/* Botón Secundario: Cancelar / Volver al Login */}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full bg-gray-50 hover:bg-gray-100 text-[#1E1E24] border border-gray-100 font-bold text-xs py-2.5 px-4 rounded-xl tracking-wider uppercase transition-all focus:outline-none cursor-pointer text-center"
            >
              ¿Ya tienes cuenta? Ingresa
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
