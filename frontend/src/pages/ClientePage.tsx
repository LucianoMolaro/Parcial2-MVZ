import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProductos, getCategorias } from "../api/api";
import { Producto } from "../types";

const BASE = "http://localhost:8000";
const PAGE_SIZE = 7;
const CART_KEY = "carrito";

interface CartItem {
  producto_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface DireccionRead {
  id: number;
  calle1: string;
  ciudad: string;
  alias?: string;
  calle2?: string;
  es_principal: boolean;
}

function getCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]"); } catch { return []; }
}
function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function apiFetch(path: string, method = "GET", body?: unknown) {
  return fetch(`${BASE}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

export default function ClientePage() {
  const [cart, setCart] = useState<CartItem[]>(getCart);
  const [page, setPage] = useState(0);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [formaPago, setFormaPago] = useState("EFECTIVO");
  const [notas, setNotas] = useState("");
  const [dirId, setDirId] = useState<number | null>(null);
  const [creandoDir, setCreandoDir] = useState(false);
  const [calle1, setCalle1] = useState("");
  const [calle2, setCalle2] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [alias, setAlias] = useState("");
  const [pedidoOk, setPedidoOk] = useState(false);

  const params = {
    nombre: filtroNombre || undefined,
    categoria_id: filtroCategoria ? parseInt(filtroCategoria) : undefined,
    solo_disponibles: true,
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  };

  const { data: productos = [] } = useQuery({
    queryKey: ["productos-cliente", params],
    queryFn: () => getProductos(params),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias-todas"],
    queryFn: () => getCategorias({ limit: 100 }),
  });

  const { data: direcciones = [], refetch: refetchDirs } = useQuery<DireccionRead[]>({
    queryKey: ["mis-direcciones"],
    queryFn: async () => {
      const res = await apiFetch("/direcciones/");
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    enabled: checkoutOpen,
  });

  const crearDirMut = useMutation({
    mutationFn: async (data: { calle1: string; ciudad: string; calle2?: string; alias?: string }) => {
      const res = await apiFetch("/direcciones/", "POST", data);
      if (!res.ok) throw new Error("Error al crear dirección");
      return res.json() as Promise<DireccionRead>;
    },
    onSuccess: (d: DireccionRead) => {
      refetchDirs();
      setDirId(d.id);
      setCreandoDir(false);
    },
  });

  const crearPedidoMut = useMutation({
    mutationFn: async () => {
      const res = await apiFetch("/pedidos/", "POST", {
        forma_pago_codigo: formaPago,
        direccion_entrega_id: dirId,
        notas: notas || undefined,
        detalles: cart.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Error al crear pedido");
      }
      return res.json();
    },
    onSuccess: () => {
      setCart([]);
      saveCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);
      setPedidoOk(true);
    },
    onError: (e: Error) => alert(e.message),
  });

  function agregarAlCarrito(p: Producto) {
    setCart((prev) => {
      const existe = prev.find((i) => i.producto_id === p.id);
      const updated = existe
        ? prev.map((i) => i.producto_id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i)
        : [...prev, { producto_id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1 }];
      saveCart(updated);
      return updated;
    });
  }

  function cambiarCantidad(producto_id: number, delta: number) {
    setCart((prev) => {
      const updated = prev
        .map((i) => i.producto_id === producto_id ? { ...i, cantidad: i.cantidad + delta } : i)
        .filter((i) => i.cantidad > 0);
      saveCart(updated);
      return updated;
    });
  }

  const total = cart.reduce((s, i) => s + i.precio * i.cantidad, 0).toFixed(2);
  const cantTotal = cart.reduce((s, i) => s + i.cantidad, 0);

  if (pedidoOk) {
    return (
      <div className="p-6 text-center">
        <p className="text-2xl font-bold text-green-600 mb-2">¡Pedido enviado!</p>
        <p className="text-gray-500 mb-4">Tu pedido fue recibido y está pendiente de confirmación.</p>
        <button onClick={() => setPedidoOk(false)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Seguir comprando
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <button onClick={() => setCartOpen(true)} className="relative bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Carrito {cantTotal > 0 && <span className="ml-1 bg-red-500 text-xs rounded-full px-1">{cantTotal}</span>}
        </button>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input className="border rounded px-3 py-1" placeholder="Buscar nombre..." value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} />
        <select className="border rounded px-3 py-1" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <button onClick={() => setPage(0)} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Buscar</button>
      </div>

      <table className="w-full border border-gray-200 rounded overflow-hidden text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Precio</th>
            <th className="p-2 text-left">Descripción</th>
            <th className="p-2 text-left">Alérgenos</th>
            <th className="p-2 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p: Producto) => {
            const enCarrito = cart.find((i) => i.producto_id === p.id);
            const alergenos = p.ingredientes.filter((i) => i.es_alergeno).map((i) => i.nombre).join(", ");
            return (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-2 font-medium">{p.nombre}</td>
                <td className="p-2 text-green-600 font-semibold">${p.precio}</td>
                <td className="p-2 text-gray-500 text-xs">{p.descripcion ?? "-"}</td>
                <td className="p-2 text-xs text-red-500">{alergenos || "-"}</td>
                <td className="p-2">
                  {enCarrito ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => cambiarCantidad(p.id, -1)} className="w-6 h-6 border rounded text-center hover:bg-gray-100">-</button>
                      <span className="w-5 text-center">{enCarrito.cantidad}</span>
                      <button onClick={() => cambiarCantidad(p.id, 1)} className="w-6 h-6 border rounded text-center hover:bg-gray-100">+</button>
                    </div>
                  ) : (
                    <button onClick={() => agregarAlCarrito(p)} className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs hover:bg-blue-600">
                      Agregar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {productos.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-400">Sin productos disponibles</td></tr>}
        </tbody>
      </table>

      <div className="flex gap-2 mt-4 items-center">
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">← Anterior</button>
        <span className="text-sm text-gray-600">Página {page + 1}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={productos.length < PAGE_SIZE} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100">Siguiente →</button>
      </div>

      {/* Sidebar carrito */}
      {cartOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setCartOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col">
            <div className="bg-blue-700 text-white px-4 py-3 flex justify-between items-center">
              <span className="font-bold">Carrito</span>
              <button onClick={() => setCartOpen(false)}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <p className="text-gray-400 text-center mt-8">El carrito está vacío</p>
              ) : (
                cart.map((item) => (
                  <div key={item.producto_id} className="flex justify-between items-center mb-3 border-b pb-2">
                    <div>
                      <p className="font-medium text-sm">{item.nombre}</p>
                      <p className="text-gray-500 text-xs">${item.precio} x {item.cantidad}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => cambiarCantidad(item.producto_id, -1)} className="w-6 h-6 border rounded text-center text-sm">-</button>
                      <span className="w-5 text-center text-sm">{item.cantidad}</span>
                      <button onClick={() => cambiarCantidad(item.producto_id, 1)} className="w-6 h-6 border rounded text-center text-sm">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-4 border-t">
                <div className="flex justify-between font-bold mb-3"><span>Total:</span><span>${total}</span></div>
                <button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  Confirmar pedido
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal checkout */}
      {checkoutOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setCheckoutOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-700 text-white px-4 py-3 flex justify-between items-center rounded-t-lg">
                <span className="font-bold">Confirmar pedido</span>
                <button onClick={() => setCheckoutOpen(false)}>✕</button>
              </div>
              <div className="p-4 flex flex-col gap-4">
                {/* Resumen */}
                <div>
                  <p className="font-semibold mb-2 text-sm">Resumen:</p>
                  {cart.map((i) => (
                    <div key={i.producto_id} className="flex justify-between text-sm text-gray-600">
                      <span>{i.nombre} x{i.cantidad}</span>
                      <span>${(i.precio * i.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span>Total:</span><span>${total}</span></div>
                </div>

                {/* Forma de pago */}
                <div>
                  <p className="font-semibold mb-1 text-sm">Forma de pago:</p>
                  <select className="border rounded px-3 py-2 w-full" value={formaPago} onChange={(e) => setFormaPago(e.target.value)}>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="MERCADOPAGO_QR">Mercado Pago QR</option>
                  </select>
                </div>

                {/* Dirección */}
                <div>
                  <p className="font-semibold mb-1 text-sm">Dirección de entrega:</p>
                  {direcciones.map((d) => (
                    <label key={d.id} className="flex items-center gap-2 mb-1 text-sm">
                      <input type="radio" name="dir" checked={dirId === d.id} onChange={() => setDirId(d.id)} />
                      {d.alias ? `${d.alias} — ` : ""}{d.calle1}{d.calle2 ? `, ${d.calle2}` : ""}, {d.ciudad}
                    </label>
                  ))}
                  {!creandoDir ? (
                    <button onClick={() => setCreandoDir(true)} className="text-blue-600 text-sm underline mt-1">+ Nueva dirección</button>
                  ) : (
                    <div className="flex flex-col gap-2 border rounded p-3 mt-2">
                      <input className="border rounded px-2 py-1 text-sm" placeholder="Calle *" value={calle1} onChange={(e) => setCalle1(e.target.value)} />
                      <input className="border rounded px-2 py-1 text-sm" placeholder="Número / Calle 2" value={calle2} onChange={(e) => setCalle2(e.target.value)} />
                      <input className="border rounded px-2 py-1 text-sm" placeholder="Ciudad *" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
                      <input className="border rounded px-2 py-1 text-sm" placeholder="Alias (ej: Casa)" value={alias} onChange={(e) => setAlias(e.target.value)} />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (!calle1 || !ciudad) return alert("Calle y ciudad son obligatorias");
                            crearDirMut.mutate({ calle1, ciudad, calle2: calle2 || undefined, alias: alias || undefined });
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Guardar
                        </button>
                        <button onClick={() => setCreandoDir(false)} className="text-gray-500 text-sm">Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notas */}
                <div>
                  <p className="font-semibold mb-1 text-sm">Notas (opcional):</p>
                  <textarea className="border rounded px-3 py-2 w-full text-sm" rows={2} placeholder="Ej: sin cebolla..." value={notas} onChange={(e) => setNotas(e.target.value)} />
                </div>

                <button
                  onClick={() => {
                    if (!dirId) return alert("Seleccioná una dirección");
                    crearPedidoMut.mutate();
                  }}
                  disabled={crearPedidoMut.isPending || !dirId}
                  className="bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 font-semibold"
                >
                  {crearPedidoMut.isPending ? "Enviando..." : "Enviar pedido"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
