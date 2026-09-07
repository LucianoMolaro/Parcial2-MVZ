import { cloudinary } from "./Cloudinary";

export interface ProductoCreate {
  nombre: string;
  precio: number;
  descripcion: string | null;
  imagenes: cloudinary[]
  producto_categoria: ProductoCategoriaCreate[]
  producto_ingrediente: ProductoIngredienteCreate[]
}

export interface ProductoCategoriaCreate{
  categoria_id: number
  es_principal: boolean 
}

export interface ProductoIngredienteCreate{
  ingrediente_id: number | null
  es_removible: boolean 
  cantidad: number | null
}