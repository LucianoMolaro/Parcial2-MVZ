export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string;
}

export interface Ingrediente {
  id: number;
  nombre: string;
  unidad: string;
}

export interface IngredienteCreate {
  nombre: string;
  unidad: string;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  categorias: Categoria[];
  ingredientes: Ingrediente[];
}

export interface ProductoCreate {
  nombre: string;
  precio: number;
  descripcion?: string;
  categoria_ids: number[];
  ingrediente_ids: number[];
}
