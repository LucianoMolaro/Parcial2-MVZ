export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  parent_id: number | null;
  imagen_url: string;
  habilitado: boolean;
  subcategorias: Categoria[];
}

export interface CategoriaFiltro{
  id: string;
  nombre: string;
  emoji: string;
  padreId: string | null;
}