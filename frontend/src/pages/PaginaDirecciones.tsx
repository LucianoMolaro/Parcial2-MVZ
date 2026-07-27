import { useRef, useEffect, useState } from 'react';
import BarraNavegacion from '../components/Navbar';

interface Direccion {
  id: number;
  alias: string;
  calle1: string;
  altura: string;
  ciudad: string;
  provincia?: string;
  es_principal?: boolean;
}

interface FormData {
  alias: string;
  calle1: string;
  altura: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  es_principal: boolean;
}

const formVacio: FormData = { alias: '', calle1: '', altura: '', ciudad: '', provincia: '', codigo_postal: '', es_principal: false };

const PER_PAGE = 5;

export default function PaginaDirecciones() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [pagina, setPagina] = useState(1);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(formVacio);
  const paginacionRef = useRef<HTMLDivElement>(null);

  const cargarDirecciones = async () => {
    const res = await fetch('http://localhost:8000/direcciones/', { credentials: 'include' });
    if (res.ok) setDirecciones(await res.json());
  };

  useEffect(() => { cargarDirecciones(); }, []);

  const totalPaginas = Math.max(1, Math.ceil(direcciones.length / PER_PAGE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const direccionesPagina = direcciones.slice((paginaActual - 1) * PER_PAGE, paginaActual * PER_PAGE);

  const abrirCrear = () => { setForm(formVacio); setEditandoId(null); setMostrarForm(true); };
  const abrirEditar = (d: Direccion) => {
    setForm({ alias: d.alias ?? '', calle1: d.calle1, altura: d.altura, ciudad: d.ciudad, provincia: d.provincia ?? '', codigo_postal: '', es_principal: d.es_principal ?? false });
    setEditandoId(d.id);
    setMostrarForm(true);
  };

  const guardar = async () => {
    const url = editandoId ? `http://localhost:8000/direcciones/${editandoId}` : 'http://localhost:8000/direcciones/';
    const method = editandoId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) { setMostrarForm(false); cargarDirecciones(); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta dirección?')) return;
    const res = await fetch(`http://localhost:8000/direcciones/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) cargarDirecciones();
  };

  const marcarPrincipal = async (id: number) => {
    const res = await fetch(`http://localhost:8000/direcciones/${id}/principal`, { method: 'PATCH', credentials: 'include' });
    if (res.ok) cargarDirecciones();
  };

  const moverPaginacion = (dir: 'izquierda' | 'derecha') => {
    paginacionRef.current?.scrollBy({ left: dir === 'izquierda' ? -72 : 72, behavior: 'smooth' });
  };

  return (
    <>
      <BarraNavegacion />
      <div className="min-h-screen bg-[#FAFAFA] py-4 px-4 sm:px-6 lg:px-8">

        <div className="w-full md:w-3/5 lg:w-1/2 mx-auto mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#1E1E24] tracking-tight sm:text-2xl">
              Mis <span className="text-[#E63946]">Direcciones</span>
            </h1>
          </div>
          <button onClick={abrirCrear} className="bg-[#1E1E24] hover:bg-[#E63946] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer">
            + Nueva
          </button>
        </div>

        {/* Formulario inline crear/editar */}
        {mostrarForm && (
          <div className="w-full md:w-3/5 lg:w-1/2 mx-auto mb-4 bg-white rounded-xl border border-gray-100/70 p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#1E1E24] uppercase tracking-wider border-b border-gray-50 pb-2">
              {editandoId ? 'Editar Dirección' : 'Nueva Dirección'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Alias (ej: Casa)" value={form.alias} onChange={e => setForm(f => ({ ...f, alias: e.target.value }))}
                className="col-span-2 w-full px-2.5 py-1.5 text-xs border border-gray-100 rounded-lg focus:outline-none focus:border-[#FFB703]" />
              <input placeholder="Calle" value={form.calle1} onChange={e => setForm(f => ({ ...f, calle1: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-100 rounded-lg focus:outline-none focus:border-[#FFB703]" />
              <input placeholder="Altura (número)" value={form.altura} onChange={e => setForm(f => ({ ...f, altura: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-100 rounded-lg focus:outline-none focus:border-[#FFB703]" />
              <input placeholder="Ciudad" value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-100 rounded-lg focus:outline-none focus:border-[#FFB703]" />
              <input placeholder="Provincia" value={form.provincia} onChange={e => setForm(f => ({ ...f, provincia: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-100 rounded-lg focus:outline-none focus:border-[#FFB703]" />
              <input placeholder="Código postal" value={form.codigo_postal} onChange={e => setForm(f => ({ ...f, codigo_postal: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-100 rounded-lg focus:outline-none focus:border-[#FFB703]" />
              <label className="col-span-2 flex items-center gap-2 text-xs font-medium text-gray-500 cursor-pointer">
                <input type="checkbox" checked={form.es_principal} onChange={e => setForm(f => ({ ...f, es_principal: e.target.checked }))} className="cursor-pointer" />
                Marcar como principal
              </label>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => setMostrarForm(false)} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer">Cancelar</button>
              <button onClick={guardar} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#E63946] text-white hover:bg-opacity-90 cursor-pointer">Guardar</button>
            </div>
          </div>
        )}

        <div className="w-full md:w-3/5 lg:w-1/2 mx-auto space-y-3">
          {direccionesPagina.map((dir) => (
            <article
              key={dir.id}
              className="bg-white rounded-xl border border-gray-100/70 p-4 shadow-xs flex flex-row items-center justify-between gap-4 transition-all duration-300 hover:shadow-md"
            >
              <div className="space-y-1 flex-grow min-w-0">
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-black text-[#1E1E24] tracking-tight">{dir.alias}</h2>
                  {dir.es_principal && (
                    <svg xmlns="http://w3.org" className="h-3.5 w-3.5 flex-shrink-0" fill="#FFB703" viewBox="0 0 24 24" stroke="#FFB703" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.151-.312.592-.312.743 0l2.257 4.574a.423.423 0 00.319.232l5.048.734c.344.05.482.472.233.717l-3.653 3.562a.42.42 0 00-.121.373l.862 5.028c.059.343-.301.605-.609.444l-4.516-2.375a.417.417 0 00-.385 0l-4.516 2.375c-.308.162-.668-.1-.609-.444l.862-5.028a.42.42 0 00-.121-.373L2.64 10.756c-.249-.245-.11-.667.233-.717l5.048-.734a.423.423 0 00.319-.232l2.257-4.574z" />
                    </svg>
                  )}
                </div>
                <div className="text-xs text-gray-500 font-medium space-y-0.5">
                  <p>Calle: <span className="text-[#1E1E24] font-semibold">{dir.calle1} {dir.altura}</span></p>
                  <p>Ciudad: <span className="text-[#1E1E24] font-semibold">{dir.ciudad}</span></p>
                  {dir.provincia && <p>Provincia: <span className="text-[#1E1E24] font-semibold">{dir.provincia}</span></p>}
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center space-x-2">
                {!dir.es_principal && (
                  <button onClick={() => marcarPrincipal(dir.id)} title="Marcar como principal"
                    className="bg-gray-50 hover:bg-[#FFB703] border border-gray-100/70 text-gray-400 hover:text-[#1E1E24] p-1.5 rounded-md transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer">
                    <svg xmlns="http://w3.org" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499c.151-.312.592-.312.743 0l2.257 4.574a.423.423 0 00.319.232l5.048.734c.344.05.482.472.233.717l-3.653 3.562a.42.42 0 00-.121.373l.862 5.028c.059.343-.301.605-.609.444l-4.516-2.375a.417.417 0 00-.385 0l-4.516 2.375c-.308.162-.668-.1-.609-.444l.862-5.028a.42.42 0 00-.121-.373L2.64 10.756c-.249-.245-.11-.667.233-.717l5.048-.734a.423.423 0 00.319-.232l2.257-4.574z" />
                    </svg>
                  </button>
                )}
                <button onClick={() => abrirEditar(dir)} title="Editar dirección"
                  className="bg-[#FFB703] hover:bg-[#1E1E24] text-[#1E1E24] hover:text-white p-1.5 rounded-md transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer">
                  <svg xmlns="http://w3.org" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button onClick={() => eliminar(dir.id)} title="Eliminar dirección"
                  className="bg-gray-50 hover:bg-[#E63946] border border-gray-100/70 text-gray-400 hover:text-white p-1.5 rounded-md transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer">
                  <svg xmlns="http://w3.org" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
          {direcciones.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100/60 p-8 text-center text-xs font-medium text-gray-400">
              No tenés direcciones guardadas.
            </div>
          )}
        </div>

        <div className="w-max mx-auto mt-10 flex items-center justify-center gap-2 select-none">
          <button onClick={() => moverPaginacion('izquierda')} className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-white hover:bg-[#E63946] border border-gray-100/80 text-gray-400 hover:text-white rounded-lg shadow-xs transition-all cursor-pointer active:scale-90 focus:outline-none" title="Página Anterior">
            <svg xmlns="http://w3.org" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div ref={paginacionRef} className="max-w-[252px] w-full flex items-center justify-start gap-2 overflow-x-auto scrollbar-hide py-2 px-2.5 mx-auto scroll-smooth">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPagina(n)} className={`flex-shrink-0 w-7 h-7 flex items-center justify-center text-xs font-black rounded-lg transition-all duration-200 shadow-xs focus:outline-none cursor-pointer ${n === paginaActual ? 'bg-[#E63946] text-white ring-2 ring-[#E63946]/10 scale-105 z-10' : 'bg-white text-[#1E1E24] hover:bg-[#FFB703] hover:text-[#1E1E24] border border-gray-100/80'}`}>{n}</button>
            ))}
          </div>
          <button onClick={() => moverPaginacion('derecha')} className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-white hover:bg-[#E63946] border border-gray-100/80 text-gray-400 hover:text-white rounded-lg shadow-xs transition-all cursor-pointer active:scale-90 focus:outline-none" title="Página Siguiente">
            <svg xmlns="http://w3.org" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </>
  );
}
