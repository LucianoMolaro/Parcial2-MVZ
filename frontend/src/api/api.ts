import { Categoria, CategoriaCreate, Ingrediente, IngredienteCreate, Producto, ProductoCreate } from "../types";

const BASE = "http://localhost:8000";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

// --- Categorias ---
export const getCategorias = async (): Promise<Categoria[]> => {
  const res = await fetch(`${BASE}/categorias/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Error al cargar categorías");
  return res.json();
};

export const crearCategoria = async (data: CategoriaCreate): Promise<Categoria> => {
  const res = await fetch(`${BASE}/categorias/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear categoría");
  return res.json();
};

export const editarCategoria = async (id: number, data: CategoriaCreate): Promise<Categoria> => {
  const res = await fetch(`${BASE}/categorias/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al editar categoría");
  return res.json();
};

export const eliminarCategoria = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE}/categorias/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error("Error al eliminar categoría");
};

// --- Ingredientes ---
export const getIngredientes = async (): Promise<Ingrediente[]> => {
  const res = await fetch(`${BASE}/ingredientes/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Error al cargar ingredientes");
  return res.json();
};

export const crearIngrediente = async (data: IngredienteCreate): Promise<Ingrediente> => {
  const res = await fetch(`${BASE}/ingredientes/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear ingrediente");
  return res.json();
};

export const editarIngrediente = async (id: number, data: IngredienteCreate): Promise<Ingrediente> => {
  const res = await fetch(`${BASE}/ingredientes/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al editar ingrediente");
  return res.json();
};

export const eliminarIngrediente = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE}/ingredientes/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error("Error al eliminar ingrediente");
};

// --- Productos ---
export const getProductos = async (): Promise<Producto[]> => {
  const res = await fetch(`${BASE}/productos/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Error al cargar productos");
  return res.json();
};

export const getProducto = async (id: number): Promise<Producto> => {
  const res = await fetch(`${BASE}/productos/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Producto no encontrado");
  return res.json();
};

export const crearProducto = async (data: ProductoCreate): Promise<Producto> => {
  const res = await fetch(`${BASE}/productos/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear producto");
  return res.json();
};

export const editarProducto = async (id: number, data: ProductoCreate): Promise<Producto> => {
  const res = await fetch(`${BASE}/productos/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al editar producto");
  return res.json();
};

export const eliminarProducto = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE}/productos/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error("Error al eliminar producto");
};
