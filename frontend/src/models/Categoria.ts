export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  parent_id: number | null;
  imagen_url: string | null;
  habilitado: boolean;
  subcategorias: Categoria[];
}
