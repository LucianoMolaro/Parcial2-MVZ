import React, { useEffect, useState } from 'react';
import BarraNavegacion from '../components/Navbar';
import { BsEnvelope, BsPersonCheck, BsPersonX, BsSearch, BsTelephone } from 'react-icons/bs';

interface UsuarioPrivate {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  celular: string | null;
  username: string;
  habilitado: boolean;
}

export default function PaginaUsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<UsuarioPrivate[]>([]);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const cargarUsuarios = async () => {
    const res = await fetch('http://localhost:8000/usuarios/', { credentials: 'include' });
    if (res.ok) setUsuarios(await res.json());
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const alternarEstadoUsuario = async (id: number, nombreCompleto: string, estadoActual: boolean) => {
    const accion = estadoActual ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Estás seguro de que deseas ${accion} al usuario "${nombreCompleto}"?`)) return;
    const res = await fetch(`http://localhost:8000/usuarios/${id}/habilitado`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habilitado: !estadoActual }),
    });
    if (res.ok) cargarUsuarios();
  };

  const usuariosFiltrados = usuarios.filter(user => {
    const matchBusqueda = `${user.nombre} ${user.apellido}`.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      user.username.toLowerCase().includes(filtroBusqueda.toLowerCase());
    if (!matchBusqueda) return false;
    if (filtroEstado === 'activo' && !user.habilitado) return false;
    if (filtroEstado === 'suspendido' && user.habilitado) return false;
    return true;
  });

  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-6 px-4 sm:px-6 lg:px-8 font-sans antialiased">
        <div className="w-4/5 mx-auto space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-red-500 tracking-tight">Control de Usuarios</h1>
            </div>
            {/* FILTROS */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none"><BsSearch /></span>
                <input
                  type="text"
                  placeholder="Buscar por nombre o usuario..."
                  value={filtroBusqueda}
                  onChange={e => setFiltroBusqueda(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-100 rounded-xl text-[#1E1E24] placeholder-gray-400 focus:outline-none focus:border-[#FFB703] transition-colors font-medium shadow-2xs"
                />
              </div>
              <select
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white border border-gray-100/80 rounded-xl shadow-xs text-[#1E1E24] focus:outline-none focus:border-[#FFB703] transition-colors font-medium cursor-pointer"
              >
                <option value="">Estado (todos)</option>
                <option value="activo">Activos</option>
                <option value="suspendido">Suspendidos</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            {usuariosFiltrados.map((user) => {
              const nombreCompleto = `${user.nombre} ${user.apellido}`;
              return (
                <div
                  key={user.id}
                  className={`bg-white rounded-xl p-3.5 border shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-200 hover:shadow-sm ${!user.habilitado ? 'border-red-100/50 bg-red-50/10' : 'border-gray-100/70'}`}
                >
                  <div className="flex items-start space-x-4 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm select-none flex-shrink-0 ${user.habilitado ? 'bg-amber-100 text-[#1E1E24]' : 'bg-red-100 text-red-500'}`}>
                      {user.nombre[0]}{user.apellido[0]}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h2 className="text-sm font-black text-[#1E1E24] tracking-tight leading-none">{nombreCompleto}</h2>
                        <span className="text-[11px] font-medium text-gray-400">@{user.username}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${user.habilitado ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                          {user.habilitado ? 'Activo' : 'Suspendido'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 text-[11px] font-medium text-stone-500 pt-0.5">
                        <span className="flex items-center gap-1"><BsEnvelope className="text-gray-400" /> {user.email}</span>
                        {user.celular && <span className="flex items-center gap-1"><BsTelephone className="text-gray-400" /> {user.celular}</span>}
                      </div>
                      <div className="flex items-center gap-x-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide pt-1">
                        <span>ID: <span className="text-stone-600 font-normal">#{user.id}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 sm:justify-end">
                    {user.habilitado ? (
                      <button
                        onClick={() => alternarEstadoUsuario(user.id, nombreCompleto, user.habilitado)}
                        className="w-full sm:w-auto bg-white hover:bg-[#E63946] text-[#E63946] hover:text-white border border-red-200 hover:border-[#E63946] font-bold text-xs px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none whitespace-nowrap"
                      >
                        <BsPersonX className="h-3.5 w-3.5" /><span>Desactivar</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => alternarEstadoUsuario(user.id, nombreCompleto, user.habilitado)}
                        className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none whitespace-nowrap"
                      >
                        <BsPersonCheck className="h-3.5 w-3.5" /><span>Reactivar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {usuariosFiltrados.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100/60 p-8 text-center text-xs font-medium text-gray-400">
                No se encontraron perfiles que coincidan con la búsqueda.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
