import { Categoria } from "./Categoria";
import { ProductoIngredienteRead } from "./ProductoIngrediente";

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string | null;
  disponible: boolean;
  stock_cantidad: number;
  habilitado: boolean;
  imagenes_url: string[];
  categorias: Categoria[];
  ingredientes: ProductoIngredienteRead[];
}