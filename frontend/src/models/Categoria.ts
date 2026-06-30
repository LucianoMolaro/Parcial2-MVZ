export interface CategoriaRead {
  id: number;
  nombre: string;
  descripcion?: string;
  parent_id?: number;
}

export interface CategoriaTree extends CategoriaRead {
  subcategorias: CategoriaTree[];
}
