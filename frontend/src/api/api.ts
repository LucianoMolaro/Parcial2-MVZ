import {
  Categoria, CategoriaCreate, CategoriaTree,
  Ingrediente, IngredienteCreate, IngredienteUpdate,
  Producto, ProductoCreate,
  Pedido,
  UnidadMedida,
} from "../types";

const BASE = "http://localhost:8000";

function opts(method = "GET", body?: unknown): RequestInit {
  const o: RequestInit = {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) o.body = JSON.stringify(body);
  return o;
}

// async function check(res: Response) {
//   if (!res.ok) throw new Error(await res.text());
//   return res;
// }
async function check(res: Response) {
  if (!res.ok) {
    const json = await res.json();
    console.log("ERROR BACKEND:");
    console.log(json);
    console.log(JSON.stringify(json, null, 2));
    throw new Error("Error");
  }
  return res;
}

// --- Categorias ---
export const getCategorias = async (params?: { nombre?: string; parent_id?: number; offset?: number; limit?: number }): Promise<Categoria[]> => {
  const q = new URLSearchParams();
  if (params?.nombre) q.set("nombre", params.nombre);
  if (params?.parent_id !== undefined) q.set("parent_id", String(params.parent_id));
  q.set("offset", String(params?.offset ?? 0));
  q.set("limit", String(params?.limit ?? 7));
  const res = await fetch(`${BASE}/categorias/?${q}`, opts());
  await check(res);
  return res.json();
};

export const getCategoriasArbol = async (): Promise<CategoriaTree[]> => {
  const res = await fetch(`${BASE}/categorias/arbol`, opts());
  await check(res);
  return res.json();
};

export const crearCategoria = async (data: CategoriaCreate): Promise<Categoria> => {
  const res = await fetch(`${BASE}/categorias/`, opts("POST", data));
  await check(res);
  return res.json();
};

export const editarCategoria = async (id: number, data: CategoriaCreate): Promise<Categoria> => {
  const res = await fetch(`${BASE}/categorias/${id}`, opts("PUT", data));
  await check(res);
  return res.json();
};

export const reactivarCategoria = async (id: number): Promise<Categoria> => {
  const res = await fetch(`${BASE}/categorias/${id}/reactivar`, opts("PATCH"));
  await check(res);
  return res.json();
};

export const eliminarCategoria = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE}/categorias/${id}`, opts("DELETE"));
  await check(res);
};

// --- Unidades de Medida ---
export const getUnidadesMedida = async (): Promise<UnidadMedida[]> => {
  const res = await fetch(`${BASE}/unidades-medida/`, opts());
  await check(res);
  return res.json();
};

// --- Ingredientes ---
export const getIngredientes = async (params?: { nombre?: string; es_alergeno?: boolean; offset?: number; limit?: number }): Promise<Ingrediente[]> => {
  const q = new URLSearchParams();
  if (params?.nombre) q.set("nombre", params.nombre);
  if (params?.es_alergeno !== undefined) q.set("es_alergeno", String(params.es_alergeno));
  q.set("offset", String(params?.offset ?? 0));
  q.set("limit", String(params?.limit ?? 7));
  const res = await fetch(`${BASE}/ingredientes/?${q}`, opts());
  await check(res);
  return res.json();
};

export const crearIngrediente = async (data: IngredienteCreate): Promise<Ingrediente> => {
  const res = await fetch(`${BASE}/ingredientes/`, opts("POST", data));
  await check(res);
  return res.json();
};

export const editarIngrediente = async (id: number, data: IngredienteUpdate): Promise<Ingrediente> => {
  const res = await fetch(`${BASE}/ingredientes/${id}`, opts("PUT", data));
  await check(res);
  return res.json();
};

export const eliminarIngrediente = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE}/ingredientes/${id}`, opts("DELETE"));
  await check(res);
};

// --- Productos ---
export const getProductos = async (params?: { nombre?: string; categoria_id?: number; solo_disponibles?: boolean; offset?: number; limit?: number }): Promise<Producto[]> => {
  const q = new URLSearchParams();
  if (params?.nombre) q.set("nombre", params.nombre);
  if (params?.categoria_id !== undefined) q.set("categoria_id", String(params.categoria_id));
  if (params?.solo_disponibles) q.set("solo_disponibles", "true");
  q.set("offset", String(params?.offset ?? 0));
  q.set("limit", String(params?.limit ?? 7));
  const res = await fetch(`${BASE}/productos/?${q}`, opts());
  await check(res);
  return res.json();
};

export const getProducto = async (id: number): Promise<Producto> => {
  const res = await fetch(`${BASE}/productos/${id}`, opts());
  await check(res);
  return res.json();
};

export const crearProducto = async (data: ProductoCreate): Promise<Producto> => {
  const res = await fetch(`${BASE}/productos/`, opts("POST", data));
  await check(res);
  return res.json();
};

export const editarProducto = async (id: number, data: ProductoCreate): Promise<Producto> => {
  const res = await fetch(`${BASE}/productos/${id}`, opts("PUT", data));
  await check(res);
  return res.json();
};

export const actualizarDisponibilidad = async (id: number, data: { stock_cantidad: number; disponible: boolean }): Promise<Producto> => {
  const res = await fetch(`${BASE}/productos/${id}/disponibilidad`, opts("PATCH", data));
  await check(res);
  return res.json();
};

export const reactivarProducto = async (id: number): Promise<Producto> => {
  const res = await fetch(`${BASE}/productos/${id}/reactivar`, opts("PATCH"));
  await check(res);
  return res.json();
};

export const eliminarProducto = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE}/productos/${id}`, opts("DELETE"));
  await check(res);
};

export const subirImagenProducto = async (id: number, file: File): Promise<Producto> => {
  const form = new FormData();
  form.append("imagen", file);
  const res = await fetch(`${BASE}/productos/${id}/imagen`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  await check(res);
  return res.json();
};

// --- Pedidos ---
export const getPedidos = async (params?: { offset?: number; limit?: number }): Promise<Pedido[]> => {
  const q = new URLSearchParams();
  q.set("offset", String(params?.offset ?? 0));
  q.set("limit", String(params?.limit ?? 7));
  const res = await fetch(`${BASE}/pedidos/?${q}`, opts());
  await check(res);
  return res.json();
};

export const cambiarEstadoPedido = async (id: number, data: { estado_pedido_codigo: string; motivo?: string }): Promise<Pedido> => {
  const res = await fetch(`${BASE}/pedidos/${id}/estado`, opts("PATCH", data));
  await check(res);
  return res.json();
};

// --- Pagos ---
export const crearPreferenciaMp = async (pedidoId: number): Promise<{ checkout_url: string; pedido_id: number }> => {
  const res = await fetch(`${BASE}/pagos/preferencia/${pedidoId}`, opts("POST"));
  await check(res);
  return res.json();
};
