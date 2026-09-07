import { cloudinary } from "./Cloudinary";

export interface CategoriaCreate {
  nombre: string;
  descripcion: string ;
  parent_id: number | null;
  cloudinary: cloudinary;  
}

export interface CategoriaRead {
  id: number;
  nombre: string;
  descripcion: string;
  habilitado: boolean
  cloudinary: cloudinary;
  parent_id: number | null
  subcategorias: CategoriaRead[]
}

