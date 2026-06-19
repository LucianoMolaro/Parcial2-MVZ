import { Categoria } from "./Categoria";
import { Ingrediente } from "./Ingrediente";

export interface ProductoPublic{
    id: number;
    nombre: string;
    precio: number;
    descripcion?: string;
    disponible: boolean;
    categorias: Categoria[];
    ingredientes: Ingrediente[];
}
