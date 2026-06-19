export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  parent_id?: number;
}

export interface CategoriaTree extends Categoria {
  subcategorias: CategoriaTree[];
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string;
  parent_id?: number;
}

export interface UnidadMedida {
  id: number;
  nombre: string;
  simbolo: string;
  tipo: string;
}

export interface Ingrediente {
  id: number;
  nombre: string;
  unidad_medida_id: number;
  unidad_medida_nombre: string;
  unidad_medida_simbolo: string;
  es_alergeno: boolean;
  stock_cantidad: number;
}

export interface IngredienteCreate {
  nombre: string;
  unidad_medida_id: number;
  es_alergeno: boolean;
  stock_cantidad: number;
}

export interface IngredienteUpdate {
  nombre: string;
  es_alergeno: boolean;
  stock_cantidad: number;
}

export interface ProductoIngredienteInput {
  ingrediente_id: number;
  cantidad: number;
}

export interface ProductoIngredienteRead {
  ingrediente_id: number;
  nombre: string;
  unidad: string;
  es_alergeno: boolean;
  stock_cantidad: number;
  cantidad: number;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  disponible: boolean;
  stock_cantidad: number;
  categorias: Categoria[];
  ingredientes: ProductoIngredienteRead[];
}

export interface ProductoCreate {
  nombre: string;
  precio: number;
  descripcion?: string;
  disponible: boolean;
  stock_cantidad: number;
  categoria_ids: number[];
  ingredientes: ProductoIngredienteInput[];
}

export interface DetallePedido {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  nombre: string;
  precio: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  forma_pago_codigo: string;
  direccion_entrega_id: number;
  estado_codigo: string;
  subtotal: number;
  costo_envio: number;
  total: number;
  notas?: string;
  detalles: DetallePedido[];
}
